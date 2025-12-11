from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_read_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    assert isinstance(response.json(), dict)

def test_signup_participant():
    response = client.post("/activities/Soccer Team/signup?email=test@example.com")
    assert response.status_code == 200
    assert response.json().get("message") == "Signed up test@example.com for Soccer Team"

def test_unregister_participant():
    response = client.delete("/activities/Soccer Team/unregister?participant=test@example.com")
    assert response.status_code == 200
    assert response.json().get("message") == "Unregistered test@example.com from Soccer Team"