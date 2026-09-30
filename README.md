# Piccolos Restaurant Management System

A full-stack restaurant management system featuring Table Reservations & Store Pickups and an Admin dashboard.

## 🛠️ Tech Stack
* **Backend:** Java Spring Boot, Hibernate / Spring Data JPA
* **Frontend:** React.js (Vite)
* **Database:** MySQL
* **Tools:** Maven, npm

---

## 📋 Prerequisites
Before you start, make sure you have the following installed on your machine:
* [Java JDK 17+](https://www.oracle.com/java/technologies/downloads/)
* [Node.js & npm](https://nodejs.org/)
* [MySQL Server & MySQL Workbench](https://dev.mysql.com/downloads/installer/)
* IntelliJ IDEA (for backend) & VS Code (for frontend)

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <YOUR_GITHUB_REPOSITORY_URL_HERE>
cd piccolos
```

### 2. Database Setup (MySQL)
Open MySQL Workbench.

Run this SQL command to create the database:

```sql
CREATE DATABASE piccolos_db;
```
> **Note:** If your local MySQL requires a password, add it to `spring.datasource.password=` inside `backend/src/main/resources/application.properties`. Do not commit your password to GitHub!

### 3. Backend Setup (Spring Boot)
1. Open the `backend` folder in IntelliJ IDEA.
2. Wait for Maven to auto-download dependencies.
3. Open `src/main/java/com/example/piccolos/BackendApplication.java`.
4. Click the green **Run** button.
5. The API will start on: `http://localhost:8081`

### 4. Frontend Setup (React)
1. Open the `frontend` folder in VS Code.
2. Open a new terminal (Ctrl + Shift + \`).
3. Install dependencies and start the server:

```bash
npm install
npm run dev
```
4. Open your browser to: `http://localhost:5173`

---

## 🌿 Git Workflow for Contributors
Do not push directly to the `main` branch. Follow these steps for new features:

1. **Pull latest code:**
   ```bash
   git pull origin main
   ```
2. **Create branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit changes:**
   ```bash
   git commit -m "Brief description of changes"
   ```
4. **Push branch:**
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Create a Pull Request** on GitHub.
## ?? Local Setup

### 1. Clone and pull the branch

git checkout feature/dev4-menu
git pull origin feature/dev4-menu


### 2. Set up the database
Create the database:

mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS piccolos_db;"


Import the shared data dump (tables, categories, sample menu items, admin account):

mysql -u root -p piccolos_db < database/piccolos_db_dump.sql


### 3. Set your MySQL password as an environment variable
The backend reads your MySQL password from an environment variable instead of storing it in the code. Before running the backend, set your **own** local MySQL root password:

$env:DB_PASSWORD="your_own_mysql_password"

This only lasts for the current terminal session � you'll need to set it again if you open a new terminal.

### 4. Run the backend

cd backend
.\mvnw.cmd spring-boot:run

Should start on http://localhost:8081.

### 5. Run the frontend

cd frontend
npm install
npm run dev

Should start on http://localhost:5173.

### 6. Test admin login
Use the shared test admin account (included in the database dump):
- Email: `admin@piccolos.com`
- Password: `admin123`

Log in at http://localhost:5173/admin/login � you'll be redirected to the Admin Dashboard.

### Food images
Sample food photos are included under rontend/public/food-images/ and are already linked to the sample menu items in the database dump.
