<h1 align="center">Whaticket Baileys cumunidade |Canal Vem Fazer</h1>

<h1 align="center">https://www.youtube.com/@vemfazer</h1>


## Vamos instalar?

FAZENDO DOWNLOAD DO INSTALADOR & INICIANDO A PRIMEIRA INSTALAÇÃO (USAR SOMENTE PARA PRIMEIRA INSTALAÇÃO):

```bash
sudo apt install -y git && git clone https://github.com/ctichat/instaladorvemfazer install && sudo chmod -R 777 ./install && cd ./install && sudo ./install_primaria
```

ACESSANDO DIRETORIO DO INSTALADOR & INICIANDO INSTALAÇÕES ADICIONAIS (USAR ESTE COMANDO PARA SEGUNDA OU MAIS INSTALAÇÃO:
```bash
cd && cd ./install && sudo ./install_instancia
```

## Usuário e senha padrão:

user: admin@admin.com
senha: 123456

## Para Instalação você precisa:

Uma VPS Ubuntu 20.04 (Configuração recomendada: 3 VCPU's + 4 GB RAM)

Subdominio para Frontend - Seu frontend

Subdominio para API -Seu backend

Email válido para certificação SSL

## Consultoria e contato:

    CANAL VEM FAZER LTDA

    Fone: 81 99627-7285(WhatsApp)


## Se o conteúdo te ajudou ajude este projeto:
(Nos ajude a trazer novos conteúdos todos os dias!)


Copia e cola:

    00020126580014BR.GOV.BCB.PIX01362e05806e-d1b7-4eb7-b1db-f02009c7bc015204000053039865802BR592552.262.410 RAPHAEL BATIST6009SAO PAULO61080540900062250521IteWKSyU6xhcUBH1lncfj63040504



Desenvolvimento
env: 

```
NODE_ENV=DEVELOPMENT      #it helps on debugging
BACKEND_URL=http://localhost
FRONTEND_URL=http://localhost:3000
PROXY_PORT=8080
PORT=8080

DB_HOST=localhost
DB_DIALECT=postgres
DB_USER=litezapchat
DB_PASS=litezap123
DB_NAME=litezapchat
DB_PORT=5432

JWT_SECRET=VtdMYnCVr4WzwckuDpJzWhlqGrQABJNp7q7DbIPVTTU=
JWT_REFRESH_SECRET=gkHyHYtyPfxGkIzEUD6664CGdMjhdqW6TWj8PkcKBIM=

REDIS_URI=redis://:litezap123@127.0.0.1:5000
REDIS_OPT_LIMITER_MAX=1
REGIS_OPT_LIMITER_DURATION=3000

USER_LIMIT=999
CONNECTIONS_LIMIT=999
CLOSED_SEND_BY_ME=true

GERENCIANET_SANDBOX=false
GERENCIANET_CLIENT_ID=Client_Id_a27c4620f0d3d9c072879dd57068fac1859354a4
GERENCIANET_CLIENT_SECRET=Client_Secret_7c62c6252b3a5b652d9c0ca92e7d4ba8c3fa6809
GERENCIANET_PIX_CERT=producao-557388-litezap
GERENCIANET_PIX_KEY=6f9686cb-4b65-4d50-85ba-72a46202a623
```

frontend 
env:

````
REACT_APP_BACKEND_URL = http://localhost:8080
REACT_APP_HOURS_CLOSE_TICKETS_AUTO = 24
````

rodar doker:
docker compose up -d


rodar o backend:
npm install
npm run dev:server

rodar o frontend:

npm install
npm run dev:start