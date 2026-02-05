
<div align="center">

# 🎫 NexusTicket: Enterprise-Grade Event Management Engine

***

[![Backend](https://img.shields.io/badge/Backend-Django%205.0%20%7C%20DRF-092E20?style=for-the-badge&logo=django&logoColor=white)](https://github.com/sinajokarr)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%2014%2B-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://github.com/sinajokarr)
[![Security](https://img.shields.io/badge/Security-JWT%20%7C%20RBAC-007ACC?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://github.com/sinajokarr)
[![Architecture](https://img.shields.io/badge/Arch-Clean%20%26%20Scalable-success?style=for-the-badge)](https://github.com/sinajokarr)

**Designed for High-Concurrency Ticketing and Optimized Data Retrieval.**

***

</div>

<br>

## 🎯 Executive Summary
**NexusTicket** is a robust backend solution for modern event ticketing platforms. Unlike generic systems, it is architected with a **Performance-First** mindset, utilizing advanced PostgreSQL indexing and custom Django Managers to ensure data integrity and sub-second query execution even under heavy load.

<br>

## 🛠️ The Architectural Core (Technical Stack)

| Layer | Technology | Key Implementation |
| :--- | :--- | :--- |
| **Framework** | `Django 5.x` | Custom User Models & Signal-based triggers. |
| **API Layer** | `DRF` | Hyperlinked APIs & Custom Permission Classes. |
| **Database** | `PostgreSQL` | Composite Indexes & Decimal precision for finance. |
| **Auth** | `Simple JWT` | Stateless security with refresh token rotation. |

---

## 💻 Technical Deep Dive: Engineered for Scale

### 🔐 1. Custom Identity Management
NexusTicket eliminates insecure standard username fields. We implement a custom `BaseUserManager` to enforce email-based identity and atomic user creation.

```python
# From accounts/models.py
def create_user(self, email, password=None, **extra_fields):
    if not email:
        raise ValueError('The Email field must be set')
    email = self.normalize_email(email)
    user = self.model(email=email, **extra_fields)
    user.set_password(password) # Enforces PBKDF2 Hashing
    user.save(using=self._db)
    return user

```

### 🎫 2. Optimized Ticketing Logic

* **Stock Integrity:** Uses `@property` methods to calculate `is_sold_out` and `remaining_capacity` dynamically, ensuring no overselling occurs.
* **Financial Precision:** Implements `DecimalField` for price management to eliminate floating-point arithmetic errors common in currency transactions.

### 🔍 3. Advanced Query Optimization

Strategic database indexing is at the heart of the project.

* **Composite Indexes:** Optimized for filtering `is_active` events sorted by `date`.
* **Unicode Slugs:** Fully supports multilingual (Persian/English) SEO-friendly URLs.

---

## 🚀 Deployment & Local Installation

Follow these steps to initialize the production-ready environment.

### 1. Initialize Environment

```bash
git clone [https://github.com/sinajokarr/NexusTicket.git](https://github.com/sinajokarr/NexusTicket.git)
cd NexusTicket

# Virtual Environment Setup
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

```

### 2. Dependency Management

Install the core engine and its performance-critical extensions.

```bash
pip install --upgrade pip
pip install -r requirements.txt

```

### 3. Environment Configuration (`.env`)

Create a `.env` file in the root directory:

```env
DEBUG=False
SECRET_KEY=your_production_key_here
DB_NAME=nexusticket_db
DB_USER=postgres
DB_PASS=your_secure_password
DB_HOST=localhost
DB_PORT=5432

```

### 4. Database Schema Deployment

Execute migrations to build the optimized indexing structure.

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser

```

### 5. Launch Service

```bash
python manage.py runserver

```

---

## 📈 Database Schema Overview

* **One-to-Many:** User → Organized Events (Protected Deletion).
* **Many-to-Many:** Events ↔ Artists, Events ↔ Categories.
* **Integrity:** `TicketClass` is strictly linked to `Event` via `CASCADE` for logical cleanup.

---

## 📬 Contact & Collaboration

| Platform | Link |
| --- | --- |
| 💼 **LinkedIn** | [Sina Jokar](https://www.linkedin.com/in/sinajokar/) |
| 📧 **Email** | [cnajokar11@yahoo.com](mailto:cnajokar11@yahoo.com) |
| 📁 **Portfolio** | [More Projects](https://github.com/sinajokarr) |

<div align="center">


