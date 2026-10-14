# SpendWise --- Personal Expense Tracker

SpendWise is a full-stack personal expense tracking application built to
help users record expenses, review spending, and understand monthly
financial activity.

> **Project status:** Core authentication and expense-tracking flows
> have been implemented. Update this README as additional features are
> completed.

## Features

-   **User authentication** --- register and sign in.
-   **Dashboard** --- view expense summaries and recent transactions.
-   **Expense management** --- add, edit, and delete expenses.
-   **Categories** --- organize expenses by Food, Transport, Shopping,
    Bills, Entertainment, Healthcare, Education, and Other.
-   **Transactions** --- review and manage recorded expenses.
-   **Reports** --- review monthly totals and category-level spending.
-   **Settings** --- account and preference interface.
-   **Responsive UI** --- dark theme with emerald accents for desktop
    and mobile.

## Technology Stack

### Frontend

-   React
-   Vite
-   Tailwind CSS
-   React Router
-   Axios
-   Lucide React

### Backend

-   Python
-   FastAPI
-   SQLAlchemy
-   Alembic for migrations, if configured in the backend

### Database

-   PostgreSQL

## Project Structure

``` text
SpendWise/
├── backend/
│   ├── app/
│   ├── requirements.txt
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── routes/
│   ├── package.json
│   └── ...
├── .gitignore
└── README.md
```

The exact backend files may differ depending on your local
configuration.

## Prerequisites

-   Python version supported by your backend dependencies
-   Node.js and npm
-   PostgreSQL
-   Git

## Getting Started

### 1. Clone the repository

``` bash
git clone https://github.com/sheshadri-mittapelly/SpendWise.git
cd SpendWise
```

### 2. Configure the backend

In PowerShell:

``` powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

If your repository contains `requirements.txt`, install dependencies:

``` powershell
pip install -r requirements.txt
```

Create a local `.env` file using the variable names expected by your
backend configuration. Set your PostgreSQL connection and authentication
secrets there. **Never commit your real `.env` file or secrets to
GitHub.**

Create the PostgreSQL database and run the migrations configured for
your project, if applicable.

Start the API using the entry point configured in your project. For
example, if the FastAPI instance is `app.main:app`:

``` powershell
uvicorn app.main:app --reload
```

The API is commonly available at `http://127.0.0.1:8000`. If enabled,
interactive API documentation is available at
`http://127.0.0.1:8000/docs`.

> If your entry point or configuration differs, use the module path and
> environment variables defined in your backend files.

### 3. Configure the frontend

Open a second terminal:

``` powershell
cd frontend
npm install
npm run dev
```

Vite prints the local development URL, commonly `http://localhost:5173`.

The current frontend API configuration uses:

``` text
http://127.0.0.1:8000/api/v1
```

If the backend host or port changes, update the frontend API
configuration. For deployment, prefer environment-based configuration
instead of hardcoded local URLs.

## API Endpoints

These routes are used by the current application setup:

  ------------------------------------------------------------------------------------
  Method                  Endpoint                             Purpose
  ----------------------- ------------------------------------ -----------------------
  `POST`                  `/api/v1/auth/register`              Register a user

  `POST`                  `/api/v1/auth/login`                 Sign in and obtain an
                                                               access token

  `GET`                   `/api/v1/auth/me`                    Retrieve the
                                                               authenticated user

  `POST`                  `/api/v1/expenses/`                  Create an expense

  `GET`                   `/api/v1/expenses/`                  List expenses

  `PUT`                   `/api/v1/expenses/{expense_id}`      Update an expense

  `DELETE`                `/api/v1/expenses/{expense_id}`      Delete an expense

  `GET`                   `/api/v1/expenses/summary/monthly`   Retrieve monthly
                                                               expense summary

  `GET`                   `/api/v1/expenses/dashboard`         Retrieve dashboard data
  ------------------------------------------------------------------------------------

Use your backend's `/docs` page to confirm exact schemas, query
parameters, and response formats.

## Security Notes

-   Keep `.env` files, passwords, database credentials, JWT signing
    secrets, private keys, and database backups out of Git.
-   Commit an `.env.example` only with placeholder values and variable
    names your application actually uses.
-   Use strong, unique secrets in deployment.
-   Restrict CORS to trusted frontend origins.
-   Verify expense endpoints only allow users to access their own
    records.
-   Use HTTPS in production.
-   Never commit real user data or production database dumps.

## Screenshots

Add screenshots when available. One possible structure is:

``` text
docs/
├── login.png
├── register.png
├── dashboard.png
├── transactions.png
└── reports.png
```

Embed a screenshot like this:

``` markdown
![SpendWise Dashboard](docs/dashboard.png)
```

## Development Workflow

``` bash
git status
git add .
git commit -m "Describe your change"
git push
```

Review staged files before committing to ensure secrets, local database
files, virtual environments, and dependency folders are excluded.

## Future Improvements

Potential future enhancements include: - Monthly budgets and budget
alerts - Recurring expenses - Report exports - Automated tests -
Deployment and continuous integration

These are suggestions, not features claimed to be implemented.

## Author

**Sheshadri Mittapelly**

GitHub: [sheshadri-mittapelly](https://github.com/sheshadri-mittapelly)

## License

No license has been specified yet. If you intend to make the project
open source, choose and add a license before others reuse or distribute
the code.
