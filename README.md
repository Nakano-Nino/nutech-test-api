# Nutech API

## Overview

PT.Nutech take home test API

## Table of Contents

1. [Installation](#installation)
2. [Usage](#usage)
3. [Documentation](#documentation)

## Installation
```bash
git clone https://github.com/Nakano-Nino/nutech-test-api.git
cd nutech-test-api
npm install
```
rename .env.example to .env then fill the required variables 

## Usage
```bash
npm start
```

## Documentation
### Base URL
localhost

### GET Endpoint
#### 1. /api/profile
Used to get User profile information (Require Authorization token)
#### 2. /api/banner
Used to get a list of banners (No Authorization token required)
#### 3. /api/services
Used to get a list of PPOB services (Require Authorization token)
#### 4. /api/balance
Used to get the latest balance information from the User (Require Authorization token)
#### 5. /api/transaction/history
Used to obtain transaction history information (Require Authorization token)

request body (optional) :
```bash
{
  "limit": insert limit here (number)
}
```

### POST Endpoint
#### 1. /api/registration
Used to register users so they can log into the application (No Authorization token required)

request body :
```bash
{
  "email": "user@nutech-integrasi.com",
  "first_name": "User",
  "last_name": "Nutech",
  "password": "abcdef1234"
}
```

#### 2. /api/login
Used to log in and get authentication in the form of JWT (Json Web Token) (No Authorization token required)

request body :
```bash
{
  "email": "user@nutech-integrasi.com",
  "password": "abcdef1234"
}
```

#### 3. /api/topup
Used to top up the balance of the User (Require Authorization token)

request body :
```bash
{
  "top_up_amount": 1000000
}
```

#### 4. /api/transaction
Used to carry out transactions from available services (Require Authorization token)

request body : 
```bash
{
  "service_code": "PULSA"
}
```

### PUT Endpoint
#### 1. /api/profile/update
Used to update User profile data (Require Authorization token)

request body :
```bash
{
  "first_name": "User Edited",
  "last_name": "Nutech Edited"
}
```
#### 2. /api/profile/image
Used to update / upload User profile image (Require Authorization token)

requesy body (multipart/form-data)
