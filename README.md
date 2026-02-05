
<div align="center">

# 🎫 NexusTicket: High-Performance Event Ticketing API Engine ✨

***

[![Developer Role: Backend](https://img.shields.io/badge/Developer%20Role-Backend%20Architect-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://github.com/sinajokarr)
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
| **Database Logic** | `PostgreSQL` (Composite Indexes), `ORM Optimization` |
| **Validation** | `Django Core Validators` (Min/Max Pricing & Capacity) |

<p align="center">
  <img src="https://img.shields.io/badge/Python%203.13-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/Django%205.x-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django">
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
</p>

---

## 💻 Technical Highlights: Architectural Excellence

### 🔐 1. Secure Identity Management
NexusTicket utilizes a custom `BaseUserManager` to handle email-based authentication and secure password hashing via `set_password`.

```python
# Example from accounts/models.py
def create_user(self, email, password=None, **extra_fields):
    if not email:
        raise ValueError(_('The Email field must be set'))
    email = self.normalize_email(email)
    user = self.model(email=email, **extra_fields)
    user.set_password(password)
    user.save(using=self._db)
    return user

```

### 🎫 2. Advanced Serialization & Logic

To ensure password security, the `UserSerializer` employs `write_only` constraints and leverages the custom manager for object creation.

```python
# Example from accounts/serializers.py
class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

```

### 🔍 3. Performance & Data Integrity

* **Inventory Management:** Uses `@property` decorators for real-time `is_sold_out` checks without redundant DB writes.
* **Concurrency Safety:** Employs `models.Index` on slug and date fields for optimized search results.

---

## 🚀 Installation & Local Setup

Execute the following commands in your terminal to set up a local development environment.

### 1. Repository Initialization

```bash
git clone [https://github.com/sinajokarr/NexusTicket.git](https://github.com/sinajokarr/NexusTicket.git)
cd NexusTicket

```

### 2. Environment Virtualization

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Mac/Linux
# On Windows use: venv\Scripts\activate

```

### 3. Dependency Packaging

```bash
# Upgrade pip and install core requirements
pip install --upgrade pip
pip install -r requirements.txt

```

### 4. Configuration (.env)

Create a `.env` file in the root directory to manage sensitive credentials:

```env
DEBUG=True
SECRET_KEY=generate_your_secure_key
DB_NAME=nexusticket_db
DB_USER=postgres
DB_PASS=your_password
DB_HOST=localhost
DB_PORT=5432

```

### 5. Schema Deployment

Build and apply the optimized database schema.

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser

```

### 6. Launch Server

```bash
python manage.py runserver

```

API Root: `http://127.0.0.1:8000/`

---

## 📊 Activity & Growth

<div align="center">

</div>

---

## 🙏 Call to Action

<div align="center">

---

### **Ready to scale your ticketing infrastructure?**

**I am available for Backend Architecture discussions and high-impact career collaborations.**

**[Let's Connect on LinkedIn](https://www.linkedin.com/in/sinajokar/)**

---

</div>
