## Description

Microservicio de payment ms con stripe y usa webhook con hookdeck

## Installation

```bash
$ npm install
```

## comando de Hookdeck

este comnado escucha el puerto correspondiente en la ruta del endpoint que tenemos que maneja el post webhook que stripe usa

```bash
hookdeck listen 3003 stripe_to_localhost --path /payments/webhook
```

**stripe_to_localhost**: es el nombre de la coneccion en hookdeck

## Running the app

```
$ npm run start:dev
```
