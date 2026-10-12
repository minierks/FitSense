import pytest

from app import MAX_MINUTES_OBSERVED, MODEL_VERSION, WORKOUT_INTENSITY, app, get_bmi, get_bmi_category

VALID = {
    "age": 25,
    "gender": "Male",
    "weight": 70,
    "height": 175,
    "experience_level": "Intermediate",
    "target_calories": 300,
}


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_health(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.get_json() == {"status": "ok", "model_version": MODEL_VERSION}


def test_predict_valid(client):
    res = client.post("/predict", json=VALID)
    assert res.status_code == 200
    body = res.get_json()
    assert isinstance(body["recommended_workout"], str) and body["recommended_workout"]
    assert isinstance(body["recommended_duration"], int) and body["recommended_duration"] > 0
    # Duration is rounded to whole minutes, so the expected burn lands close to (not exactly on) the target
    assert abs(body["expected_calorie_burn"] - 300) <= 15
    assert body["bmi"] == 22.9
    assert body["bmi_category"] == "Normal"
    assert body["model_version"] == MODEL_VERSION
    assert "warning" not in body


def test_predict_returns_top_recommendations(client):
    body = client.post("/predict", json=VALID).get_json()
    recommendations = body["recommendations"]
    assert len(recommendations) == 3
    assert len({r["workout"] for r in recommendations}) == 3
    for r in recommendations:
        assert r["workout"] in WORKOUT_INTENSITY
        assert r["intensity"] in ("Low", "Moderate", "High")
        assert r["duration_minutes"] > 0
        assert r["calories_per_minute"] > 0
    # Top-level fields mirror the best recommendation
    assert body["recommended_workout"] == recommendations[0]["workout"]
    assert body["recommended_duration"] == recommendations[0]["duration_minutes"]
    assert body["expected_calorie_burn"] == recommendations[0]["expected_calorie_burn"]


def test_bigger_target_means_higher_burn_rate(client):
    def top_rate(calories):
        body = client.post("/predict", json={**VALID, "target_calories": calories}).get_json()
        return body["recommendations"][0]["calories_per_minute"]

    assert top_rate(600) > top_rate(150)


@pytest.mark.parametrize("calories", [100, 300, 600, 1000, 1500])
def test_beginners_never_get_high_intensity_workouts(client, calories):
    body = client.post(
        "/predict", json={**VALID, "experience_level": "Beginner", "target_calories": calories}
    ).get_json()
    assert all(r["intensity"] != "High" for r in body["recommendations"])


def test_accepts_all_trained_categories(client):
    res = client.post("/predict", json={**VALID, "gender": "Non-binary", "experience_level": "Professional"})
    assert res.status_code == 200


def test_warns_when_session_is_unrealistically_long(client):
    body = client.post(
        "/predict", json={**VALID, "experience_level": "Beginner", "target_calories": 1500}
    ).get_json()
    assert body["recommended_duration"] > MAX_MINUTES_OBSERVED
    assert "longer than any session" in body["warning"]


def test_predict_accepts_numeric_strings(client):
    res = client.post("/predict", json={**VALID, "age": "25", "weight": "70.5"})
    assert res.status_code == 200


@pytest.mark.parametrize(
    "override, message",
    [
        ({"age": 10}, "'age' must be between"),
        ({"age": 25.5}, "'age' must be a whole number"),
        ({"weight": "heavy"}, "'weight' must be a number"),
        ({"height": 0}, "'height' must be between"),
        ({"target_calories": True}, "'target_calories' must be a number"),
        ({"gender": "male"}, "'gender' must be one of"),
        ({"experience_level": "Expert"}, "'experience_level' must be one of"),
    ],
)
def test_predict_invalid_values(client, override, message):
    res = client.post("/predict", json={**VALID, **override})
    assert res.status_code == 400
    assert message in res.get_json()["error"]


def test_predict_missing_fields(client):
    res = client.post("/predict", json={"age": 25})
    assert res.status_code == 400
    assert "Missing required field(s)" in res.get_json()["error"]


def test_predict_non_json_body(client):
    res = client.post("/predict", data="not json", content_type="text/plain")
    assert res.status_code == 400


@pytest.mark.parametrize(
    "bmi, category",
    [(18.4, "Underweight"), (18.5, "Normal"), (24.9, "Normal"), (25, "Overweight"), (30, "Obese")],
)
def test_bmi_category(bmi, category):
    assert get_bmi_category(bmi) == category


def test_get_bmi():
    assert round(get_bmi(70, 175), 2) == 22.86
