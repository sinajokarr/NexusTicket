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

I built this system to demonstrate how to bridge the gap between complex business logic (coupons, tiered pricing) and robust backend infrastructure (Redis caching, background workers).

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

| Category | technologies |
| :--- | :--- |
| **Framework** | `Django 5.x` & `Django REST Framework` (DRF) |
| **Security** | `Simple JWT` (Stateless Auth), `Custom Permissions`, `RBAC` |
| **Concurrency** | `Database-level Locking`, `F() Expressions` (Atomic Increments) |
| **Background Jobs** | `Celery` + `Redis` (Automated Order Expiration) |

### 💾 Data & Infrastructure

| Category | technologies |
| :--- | :--- |
| **Primary DB** | `MySQL 8.0` (Optimized Indexes for Search & Filtering) |
| **Broker/Cache** | `Redis` (Celery Broker & API Throttling) |
| **Environment** | `Docker` & `Docker-Compose` (Orchestrated Services) |
| **Testing** | `Pytest` (Integration/Smoke Testing), `Model-Bakery` |

---

## 💻 Technical Deep Dive: Challenges & Solutions

### 🏎️ 1. Preventing Race Conditions (Atomic Booking)
* **Challenge:** Multiple users buying the last remaining ticket at the exact same millisecond.
* **My Solution:** Implemented **`select_for_update()`** and **`F()` expressions**. This ensures that the database handles the increment/decrement of ticket capacity at the engine level, preventing data corruption without sacrificing performance.
* **Impact:** Guaranteed **Zero Over-selling** even under high-concurrency scenarios.

### ⏱️ 2. Automated Order Lifecycle (Celery Workers)
* **Challenge:** Tickets being "locked" by users who never complete the payment.
* **My Solution:** Designed a **Celery-based background task** that monitors "Pending" orders. If a payment is not verified within 15 minutes, the task automatically cancels the order and restores the ticket capacity.
* **Impact:** Maximized ticket availability and automated inventory management.

### 🛡️ 3. Secure Financial Flow (Mock-Bank Integration)
* **Challenge:** Securely updating order status only after verified bank responses.
* **My Solution:** Developed a robust **Callback/Verify logic** with atomic updates. The system ensures that the ticket is marked as "Paid" only when a valid `authority_id` is matched and verified via the simulated bank gateway.
* **Impact:** 100% accurate financial reporting and order synchronization.

---

## 📊 Quality Assurance: The "Green" Proof

This project is backed by a comprehensive **Master Integration Test Suite** that validates every layer of the application.

```bash
# Executing the full suite in Docker environment
docker exec -it nexusticket_web python -m pytest tests/test_nexus_ultimate.py -v
````

  * **Accounts:** JWT Authentication & Custom User Manager validation.
  * **Coupons:** Precision testing of percentage-based and fixed-amount discounts.
  * **Integration:** End-to-End flow from Event creation to successful Bank verification.
  * **Edge Cases:** Capacity limit enforcement and unauthorized review blocking.

-----

## 💡 Engineering Principles

  * **DRY (Don't Repeat Yourself):** Heavy use of Serializer inheritance and Mixins.
  * **Separation of Concerns:** Isolated logic for Events, Payments, and Orders.
  * **Scalability:** Fully Dockerized and ready to be deployed on AWS/DigitalOcean with minimal config changes.

-----

\<div align="center"\>

-----

### **Ready to see high-performance code in action?**

[Explore the Repository](https://www.google.com/url?sa=E&source=gmail&q=https://github.com/sinajokarr/NexusTicket) | [Contact Sina](mailto:cnajokar11@yahoo.com)

-----

\</div\>
