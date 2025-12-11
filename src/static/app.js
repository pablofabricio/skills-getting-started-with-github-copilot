document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants">
            <strong>Participants:</strong>
            <ul>
              ${details.participants.map(participant => `
                <li>
                  ${participant}
                  <button class='delete-participant' data-activity='${name}' data-participant='${participant}'>
                    ✖
                  </button>
                </li>
              `).join("")}
            </ul>
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("Successfully registered!");

        // Dynamically update the participants list for the activity
        const activityCard = document.querySelector(`.activity-card h4:contains('${activity}')`).parentElement;
        const participantsList = activityCard.querySelector(".participants ul");

        const newParticipant = document.createElement("li");
        newParticipant.innerHTML = `
          ${email}
          <button class='delete-participant' data-activity='${activity}' data-participant='${email}'>
            ✖
          </button>
        `;

        participantsList.appendChild(newParticipant);

        // Update spots left
        const spotsLeftElement = activityCard.querySelector("p:contains('Availability')");
        const spotsLeftText = spotsLeftElement.textContent.match(/\d+/)[0];
        spotsLeftElement.textContent = `Availability: ${spotsLeftText - 1} spots left`;
      } else {
        alert(result.detail || "Failed to register participant.");
      }
    } catch (error) {
      console.error("Error registering participant:", error);
      alert("An error occurred. Please try again.");
    }
  });

  // Event delegation for delete participant buttons
  document.addEventListener("click", async (event) => {
    if (event.target.classList.contains("delete-participant")) {
      const button = event.target;
      const activity = button.getAttribute("data-activity");
      const participant = button.getAttribute("data-participant");

      try {
        const response = await fetch(
          `/activities/${encodeURIComponent(activity)}/unregister?participant=${encodeURIComponent(participant)}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          alert(`${participant} has been unregistered from ${activity}.`);
          fetchActivities(); // Refresh the activities list
        } else {
          const result = await response.json();
          alert(result.detail || "Failed to unregister participant.");
        }
      } catch (error) {
        console.error("Error unregistering participant:", error);
        alert("An error occurred. Please try again.");
      }
    }
  });

  // Initialize app
  fetchActivities();
});
