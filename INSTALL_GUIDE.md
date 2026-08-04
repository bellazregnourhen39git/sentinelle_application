# Sentinelle Application - Installation Guide

## Prerequisites

Make sure Docker and Docker Compose are installed on your server:

```bash
docker --version
docker compose version
```

If not installed, run:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable docker
sudo systemctl start docker
```

---

## Step 1: Create the project directory

```bash
mkdir -p /home/mehdi/sentinelle
cd /home/mehdi/sentinelle
```

---

## Step 2: Create the docker-compose file

Run this command to create the file:

```bash
cat > docker-compose.client.yml << 'EOF'
version: "3.9"

services:
  db:
    image: postgres:16-alpine
    container_name: sentinelle-db
    environment:
      POSTGRES_DB: sentinelle_db
      POSTGRES_USER: sentinelle
      POSTGRES_PASSWORD: sentinelle
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sentinelle -d sentinelle_db"]
      interval: 5s
      timeout: 5s
      retries: 10

  backend:
    image: mohamedbouzidcloud/sentinelle-backend:latest
    pull_policy: always
    container_name: sentinelle-backend
    environment:
      DB_ENGINE: django.db.backends.postgresql
      DB_HOST: sentinelle-db
      DB_PORT: 5432
      DB_USER: sentinelle
      DB_PASSWORD: sentinelle
      DB_NAME: sentinelle_db
    depends_on:
      db:
        condition: service_healthy
    restart: on-failure
    ports:
      - "8000:8000"

  frontend:
    image: mohamedbouzidcloud/sentinelle-frontend:latest
    pull_policy: always
    container_name: sentinelle-frontend
    depends_on:
      - backend
    ports:
      - "80:80"

volumes:
  postgres_data:
EOF
```

---

## Step 3: Stop any old containers and clean up

```bash
cd /home/mehdi/sentinelle
docker compose -f docker-compose.client.yml down -v
docker image rm -f mohamedbouzidcloud/sentinelle-backend:latest 2>/dev/null
docker image rm -f mohamedbouzidcloud/sentinelle-frontend:latest 2>/dev/null
```

---

## Step 4: Pull the images and start

```bash
cd /home/mehdi/sentinelle
docker compose -f docker-compose.client.yml pull
docker compose -f docker-compose.client.yml up -d
```

---

## Step 5: Verify everything is running

```bash
docker compose -f docker-compose.client.yml ps
```

You should see **3 containers** all showing `Up` or `running`:

| Name               | Status |
|---------------------|--------|
| sentinelle-db       | Up     |
| sentinelle-backend  | Up     |
| sentinelle-frontend | Up     |

If any container shows `Exit` or `Restarting`, check the logs:

```bash
docker compose -f docker-compose.client.yml logs backend --tail=50
docker compose -f docker-compose.client.yml logs db --tail=50
```

---

## Step 6: Test the application

Open your browser and go to:

```
http://YOUR_SERVER_IP
```

You should see the Sentinelle login page.

### Default Login Credentials

| Email                        | Password  | Role         |
|------------------------------|-----------|--------------|
| msi@sentinelle.tn            | msi       | Super Admin  |
| medbouzid1234567@gmail.com   | lolalola  | Practitioner |

---

## Step 7: Check the backend API

```bash
curl http://localhost:8000/api/login/
```

You should get a response (not a connection error).

---

## Troubleshooting

### If the backend keeps restarting:

```bash
docker compose -f docker-compose.client.yml logs backend --tail=100
```

### If the database is not reachable:

```bash
docker compose -f docker-compose.client.yml exec db pg_isready -U sentinelle -d sentinelle_db
```

### To restart everything from scratch:

```bash
cd /home/mehdi/sentinelle
docker compose -f docker-compose.client.yml down -v
docker compose -f docker-compose.client.yml pull
docker compose -f docker-compose.client.yml up -d
```

### To stop the application:

```bash
cd /home/mehdi/sentinelle
docker compose -f docker-compose.client.yml down
```

### To view all running containers:

```bash
docker ps
```

---

## Server Requirements

- **OS**: Ubuntu 20.04+ or Debian 10+
- **RAM**: Minimum 2 GB
- **Disk**: Minimum 10 GB free space
- **Ports**: 80 and 8000 must be open

---

## Important Notes

1. **Do NOT change the passwords** in the compose file unless you know what you are doing.
2. **Back up your database** regularly if you have important data.
3. The application data is stored in a Docker volume called `postgres_data`. It persists even if you stop the containers.
4. To update to a newer version, just run:

```bash
cd /home/mehdi/sentinelle
docker compose -f docker-compose.client.yml pull
docker compose -f docker-compose.client.yml up -d
```
