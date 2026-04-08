
<div align="center">
  
# 🎟️ NexusTicket: High-Performance Ticket Reservation System ✨
  
***
  
[![Technology: Django/DRF](https://img.shields.io/badge/Framework-Django%205.x%20%7C%20DRF-092E20?style=for-the-badge&logo=django&logoColor=white)](https://github.com/sinajokarr)
[![Database: MySQL](https://img.shields.io/badge/Database-MySQL%208-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://github.com/sinajokarr)
[![Task Queue: Celery](https://img.shields.io/badge/Async%20Tasks-Celery%20%7C%20Redis-green?style=for-the-badge&logo=celery&logoColor=white)](https://github.com/sinajokarr)
[![Infrastructure: Docker](https://img.shields.io/badge/Infrastructure-Docker--Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://github.com/sinajokarr)
  
***
</div>

<br>

## 🎯 Project Vision: Solving the "Flash Sale" Challenge

**NexusTicket** is a production-grade, high-concurrency ticket reservation API designed to handle the critical challenges of event booking. The core focus of this architecture is **Data Integrity** and **Atomic Transactions**, ensuring that even under heavy load, tickets are never over-sold and financial transactions remain consistent.

I built this system to bridge the gap between complex business logic (coupons, tiered pricing) and robust backend infrastructure (Redis caching, background workers).

<br>

### 📬 Connect with the Architect

| Platform | Link |
| :--- | :--- |
| 🔗 **LinkedIn** | [Sina Abbasi Jokar - Profile](https://www.linkedin.com/in/sinajokar/) 💼 |
| 📧 **Email** | [cnajokar11@yahoo.com](mailto:cnajokar11@yahoo.com) |
| 🚀 **Live Demo/Repo** | [NexusTicket Repository](https://github.com/sinajokarr/NexusTicket) |

---

## 🛠️ The Nexus Stack: Technical Specifications

This project leverages a modern, containerized stack to ensure high availability and scalability.

### 🌐 Core Backend & Logic
* **Framework:** `Django 5.x` & `Django REST Framework` (DRF)
* **Security:** `Simple JWT` (Stateless Auth), `Custom Permissions`, `RBAC`
* **Concurrency:** `Database-level Locking`, `F() Expressions` (Atomic Increments)
* **Background Jobs:** `Celery` + `Redis` (Automated Order Expiration)

### 💾 Data & Infrastructure
* **Primary DB:** `MySQL 8.0` (Optimized Indexes for Search & Filtering)
* **Broker/Cache:** `Redis` (Celery Broker & API Throttling)
* **Environment:** `Docker` & `Docker-Compose` (Orchestrated Services)
* **Testing:** `Pytest` (Integration/Smoke Testing), `Model-Bakery`

---

## 🚀 Getting Started: Installation & Run Guide

NexusTicket is fully containerized. You don't need to install Python or MySQL on your local machine.

### 📋 Prerequisites
- **Docker** and **Docker Compose** installed.
- A `.env` file (see the Environment Variables section below).

### 🛠️ Execution Steps

1. **Clone the Project:**
   ```bash
   git clone [https://github.com/sinajokarr/NexusTicket.git](https://github.com/sinajokarr/NexusTicket.git)
   cd NexusTicket


2.  **Launch Services:**
    This command builds the images and starts Django, MySQL, Redis, and Celery.

    ```bash
    docker-compose up -d --build
    ```

3.  **Initialize Database:**

    ```bash
    docker exec -it nexusticket_web python manage.py migrate
    ```

4.  **Create Admin User:**

    ```bash
    docker exec -it nexusticket_web python manage.py createsuperuser
    ```

### 🛣️ API Access & Documentation

  - **Swagger UI:** `http://127.0.0.1:8000/api/docs/`
  - **ReDoc:** `http://127.0.0.1:8000/api/redoc/`
  - **Admin Panel:** `http://127.0.0.1:8000/admin/`

-----

## 🔑 Environment Variables (`.env.example`)

To run this project, create a `.env` file in the root directory and add the following:

```env
DEBUG=True
SECRET_KEY=your_secret_key_here
DATABASE_URL=mysql://root:rootpassword@db:3306/nexusticket
CELERY_BROKER_URL=redis://redis:6379/0
```

-----

## 💻 Technical Deep Dive: Challenges & Solutions

### 🏎️ 1. Preventing Race Conditions (Atomic Booking)

Multiple users buying the last ticket simultaneously is a classic concurrency problem. I solved this by implementing **`select_for_update()`** and **`F()` expressions**. This ensures the database handles the increment/decrement at the engine level, guaranteeing **Zero Over-selling**.

### ⏱️ 2. Automated Order Lifecycle (Celery Workers)

To prevent "locked" inventory from unpaid orders, I designed a **Celery-based background task**. It monitors "Pending" orders and automatically cancels them after 15 minutes, restoring ticket capacity to the pool.

### 🛡️ 3. Secure Financial Flow (Mock-Bank Integration)

The system uses a robust **Callback/Verify logic** with atomic updates. Orders are marked as "Paid" only after a valid `authority_id` is matched and verified via the simulated bank gateway, ensuring 100% data synchronization.

-----

## 📊 Quality Assurance: The "Green" Proof

Every critical layer is validated by a comprehensive **Master Integration Test Suite**.

```bash
# Run the full suite inside the Docker environment
docker exec -it nexusticket_web python -m pytest tests/test_nexus_ultimate.py -v
```

  - **Accounts:** Validates JWT Auth & Custom User Management.
  - **Coupons:** Precision testing of percentage and fixed discounts.
  - **Integration:** End-to-End flow from Event creation to Bank verification.
  - **Edge Cases:** Capacity enforcement and unauthorized review blocking.

-----

## 💡 Engineering Principles

  - **DRY (Don't Repeat Yourself):** Heavy use of Serializer inheritance and Mixins.
  - **Separation of Concerns:** Isolated logic for Events, Payments, and Orders.
  - **Scalability:** Fully Dockerized and ready for cloud deployment (AWS/GCP/DigitalOcean).

-----

\<div align="center"\>

### **Ready to see high-performance code in action?**

[Explore the Repository](https://github.com/sinajokarr/NexusTicket) | [Contact Sina Abbasi Jokar](mailto:cnajokar11@yahoo.com)

\</div\>

```
```* **Testing:** `Pytest` (Integration/Smoke Testing), `Model-Bakery`

---

## 🚀 Getting Started: Installation & Run Guide

NexusTicket is fully containerized. You don't need to install Python or MySQL on your local machine.

### 📋 Prerequisites
- **Docker** and **Docker Compose** installed.
- A `.env` file (see the Environment Variables section below).

### 🛠️ Execution Steps

1. **Clone the Project:**
`bash
   git clone [https://github.com/sinajokarr/NexusTicket.git](https://github.com/sinajokarr/NexusTicket.git)
   cd NexusTicket


2.  **Launch Services:**
    This command builds the images and starts Django, MySQL, Redis, and Celery.

    ```bash
    docker-compose up -d --build
    ```

3.  **Initialize Database:**

    ```bash
    docker exec -it nexusticket_web python manage.py migrate
    ```

4.  **Create Admin User:**

    ```bash
    docker exec -it nexusticket_web python manage.py createsuperuser
    ```

### 🛣️ API Access & Documentation

  - **Swagger UI:** `http://127.0.0.1:8000/api/docs/`
  - **ReDoc:** `http://127.0.0.1:8000/api/redoc/`
  - **Admin Panel:** `http://127.0.0.1:8000/admin/`

-----

## 🔑 Environment Variables (`.env.example`)

To run this project, create a `.env` file in the root directory and add the following:

```env
DEBUG=True
SECRET_KEY=your_secret_key_here
DATABASE_URL=mysql://root:rootpassword@db:3306/nexusticket
CELERY_BROKER_URL=redis://redis:6379/0
```

-----

## 💻 Technical Deep Dive: Challenges & Solutions

### 🏎️ 1. Preventing Race Conditions (Atomic Booking)

Multiple users buying the last ticket simultaneously is a classic concurrency problem. I solved this by implementing **`select_for_update()`** and **`F()` expressions**. This ensures the database handles the increment/decrement at the engine level, guaranteeing **Zero Over-selling**.

### ⏱️ 2. Automated Order Lifecycle (Celery Workers)

To prevent "locked" inventory from unpaid orders, I designed a **Celery-based background task**. It monitors "Pending" orders and automatically cancels them after 15 minutes, restoring ticket capacity to the pool.

### 🛡️ 3. Secure Financial Flow (Mock-Bank Integration)

The system uses a robust **Callback/Verify logic** with atomic updates. Orders are marked as "Paid" only after a valid `authority_id` is matched and verified via the simulated bank gateway, ensuring 100% data synchronization.

-----

## 📊 Quality Assurance: The "Green" Proof

Every critical layer is validated by a comprehensive **Master Integration Test Suite**.

```bash
# Run the full suite inside the Docker environment
docker exec -it nexusticket_web python -m pytest tests/test_nexus_ultimate.py -v
```

  - **Accounts:** Validates JWT Auth & Custom User Management.
  - **Coupons:** Precision testing of percentage and fixed discounts.
  - **Integration:** End-to-End flow from Event creation to Bank verification.
  - **Edge Cases:** Capacity enforcement and unauthorized review blocking.

-----

## 💡 Engineering Principles

  - **DRY (Don't Repeat Yourself):** Heavy use of Serializer inheritance and Mixins.
  - **Separation of Concerns:** Isolated logic for Events, Payments, and Orders.
  - **Scalability:** Fully Dockerized and ready for cloud deployment (AWS/GCP/DigitalOcean).

-----

\<div align="center"\>

-----

### **Ready to see high-performance code in action?**

[Explore the Repository](https://github.com/sinajokarr/NexusTicket) | [Contact Sina Abbasi Jokar](mailto:cnajokar11@yahoo.com)

-----

\</div\>
