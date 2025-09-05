## Environment Variables

### Frontend
Copy `/frontend/.env.example` to `/frontend/.env` and change the values:

| Variable              | Description                            | Default                 |
| --------------------- | -------------------------------------- | ----------------------- |
| `VITE_BACKEND_ORIGIN` | Backend Origin on same device for vite | `http://localhost:4000` |


### Backend
Copy `/backend/.env.example` to `/backend/.env` and change the values:

| Variable            | Description                | Default |
| ------------------- | -------------------------- | ------- |
| `PORT`              | Port for Backend Server    | `4000`  |
| `JWT_SECRET`        | Secret for jsonwebtoken    | `none`  |
| `AUTH_TOKEN_TTL`    | Auth Token Time to Live    | `"10m"` |
| `REFRESH_TOKEN_TTL` | Refresh Token Time to Live | `"7d"`  |
