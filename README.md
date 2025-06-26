# Millennium Market (FRC Marketplace)

[https://millenniummarket.net/](https://millenniummarket.net/)

## Overview

Millennium Market is a web platform designed for FIRST Robotics Competition (FRC) teams to buy, sell, loan, and request parts, as well as communicate and collaborate with other teams. The platform features a modern, intuitive interface and supports real-time messaging, user authentication, and a marketplace for FRC-specific components.

---

## Features

- **User Accounts:** Register/login as an FRC team, manage your profile, and set your team's details.
- **Parts Marketplace:** List, search, and filter FRC parts for sale or loan, including categories and manufacturers.
- **Requests:** Post requests for parts you need, including quantity, urgency, and event context.
- **Sales & Loans:** Offer parts for sale, donation, or loan, and fulfill requests from other teams.
- **Messaging:** Direct messaging system for teams to communicate, including notifications and read receipts.
- **Event Integration:** Link requests and sales to specific FRC events.
- **Email Notifications:** Automated emails for account activation, password resets, and request/sale updates.
- **Team Directory:** Browse and connect with other FRC teams.
- **Profile Management:** Edit your team's information, photo, and contact details.

---

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, Material UI, Google Maps integration.
- **Backend:** Django, Django REST Framework, Channels (WebSockets), Celery (background tasks), PostgreSQL, Redis.
- **Other:** Docker, Nginx (for production), environment-based configuration.

---

## How It Works

1. **Sign Up:** Create an account for your FRC team, set your team number, name, and contact info.
2. **Browse Parts:** Search or filter available parts by category, manufacturer, or keyword.
3. **Post Requests:** If you need a part, create a request specifying details and urgency.
4. **List Parts for Sale/Loan:** Offer your team's spare parts for sale, donation, or loan.
5. **Fulfill Requests:** See what other teams need and offer to fulfill their requests.
6. **Messaging:** Use the built-in messaging system to coordinate trades, sales, or ask questions.
7. **Notifications:** Receive email and in-app notifications for important updates.
8. **Event Support:** Link your activity to specific FRC events for easier coordination.

---

## Who Is It For?

- FRC teams looking to buy, sell, or loan parts
- Teams seeking to connect and collaborate with others in the FRC community
- Mentors and students managing team resources

---

## Acknowledgements

- [FIRST Robotics Competition](https://www.firstinspires.org/robotics/frc)
- [The Blue Alliance](https://www.thebluealliance.com/) (for team avatars and event data)
- [Django](https://www.djangoproject.com/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)

---

For more information, visit [millenniummarket.net](https://millenniummarket.net/) and explore the platform!
