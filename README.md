
<div align="center">

# 🎫 NexusTicket: High-Performance Event Ticketing API Engine ✨

***

[![Developer Role: Backend](https://img.shields.io/badge/Architecture-RESTful%20API-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://github.com/sinajokarr)
[![Framework: Django](https://img.shields.io/badge/Framework-Django%205.x-092E20?style=for-the-badge&logo=django&logoColor=white)](https://github.com/sinajokarr)
[![Database: PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2014%2B-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://github.com/sinajokarr)
[![Security: JWT](https://img.shields.io/badge/Security-JWT%20%7C%20RBAC-007ACC?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://github.com/sinajokarr)

***

</div>

<br>

## 🎯 Project Overview: Scalable & Secure Event Management

**NexusTicket** is a production-grade backend ecosystem engineered for high-concurrency event ticketing. The architecture prioritizes **data integrity, advanced security protocols, and extreme query optimization**. By leveraging Django 5.x and PostgreSQL features like composite indexing and strict schema validation, NexusTicket provides a seamless experience for organizers and ticket buyers alike.

I champion a **"Performance-First"** approach, ensuring that complex relational data—such as multiple ticket classes and artist management—is delivered via lightning-fast API responses.

<br>

### 📬 Professional Links & Contact

| Platform | Link |
| :--- | :--- |
| 🔗 **LinkedIn** | [Sina Jokar - LinkedIn](https://www.linkedin.com/in/sinajokar/) 💼 |
| 📁 **GitHub Profile** | [Sina Jokar GitHub](https://github.com/sinajokarr) |
| 📧 **Contact** | [cnajokar11@yahoo.com](mailto:cnajokar11@yahoo.com) |

---

## 🛠️ The Production Toolbox: Technical Specifications

### 🌐 Backend Ecosystem

| Category | Skills |
| :--- | :--- |
| **Core Frameworks** | `Django 5.0`, `Django REST Framework (DRF)` |
| **Authentication** | `Simple JWT` (Stateless Auth), `Custom User Models` |
| **Database Logic** | `PostgreSQL` (Composite Indexes, JSONB), `ORM Optimization` |
| **Image Handling** | `Pillow` (Cloud-ready storage paths) |

<p align="center">
  <img src="https://img.shields.io/badge/Python%203.12-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/Django%205.x-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django">
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
</p>

---

## 💻 Technical Highlights: Architectural Excellence

### 🎫 1. Advanced Ticketing Logic
* **Challenge:** Managing real-time inventory and financial accuracy for diverse ticket classes.
* **Solution:** Implemented **DecimalField** for zero-rounding-error financial data and **Calculated Properties** (`@property`) to determine `is_sold_out` and `remaining_capacity` without redundant database writes.

### 🔍 2. Extreme Query Optimization
* **Challenge:** High latency when filtering events by date, location, and activity status.
* **Solution:** Designed **Composite Indexes** (`models.Index`) specifically for high-traffic query paths. Utilized `select_related` and `prefetch_related` to eliminate N+1 query problems in nested Serializers.

### 🔐 3. Security & Global Readiness
* **Identity:** Transitioned to an **Email-based Custom User Model** for improved security and UX.
* **SEO & i18n:** Implemented **Unicode SlugFields** to support multi-language SEO-friendly URLs and utilized `gettext_lazy` for localized API responses.

---

## 🚀 Installation & Deployment Guide

Follow these steps to deploy and run the NexusTicket engine on your local environment.

### 1. Clone & Environment Setup
```bash
git clone [https://github.com/sinajokarr/NexusTicket.git](https://github.com/sinajokarr/NexusTicket.git)
cd NexusTicket

# Initialize Virtual Environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

```

### 2. Dependency Management

Install the production-ready packaging requirements.

```bash
pip install --upgrade pip
pip install -r requirements.txt

```

### 3. Environment Variables

Create a `.env` file in the project root to store sensitive configuration:

```env
DEBUG=True
SECRET_KEY=your_secure_secret_key
DB_NAME=nexusticket_db
DB_USER=postgres
DB_PASS=password
DB_HOST=localhost
DB_PORT=5432

```

### 4. Database Initialization

Execute migrations to build the optimized schema.

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser

```

### 5. Running the API

```bash
python manage.py runserver

```

The API will be available at `http://127.0.0.1:8000/`.

---

## 📊 Activity & Growth

<div align="center">

</div>

---

## 🙏 Call to Action

<div align="center">

---

### **Interested in scaling your event infrastructure?**

**I am available for Backend Architecture discussions and high-impact career collaborations.**

**[Let's Connect on LinkedIn](https://www.linkedin.com/in/sinajokar/)**

---

</div>

