## Webhook for translators

## Used technologies

### Nuxt

### NVM

NVM allows you to quickly install and use different versions of node via the command line.

[Read more](https://github.com/nvm-sh/nvm)

## Requirements

Below are the required tools which need to be installed before you can install and use the app. Go to each tool's website and follow their install instructions.

- [NVM](https://github.com/nvm-sh/nvm) (Node Version Managment)

## Setup

1. Run `nvm use`. This will prompt you to install the given node version or activate the node version if it's already installed.

2. Run `npm install`. This will install all your node modules you need to run the application.

3. Create an `.env` file based on the `.env.example` file.

4. Use ngrok for connecting the Dato webhoook to the local server

6. Run `yarn dev --host`. This will run the Nuxt/Vue development server.

7. Go to https://local.ppds.com:3000 in your browser.

8. Happy coding!

## Running

### DEV server

```shell
npm run start
```

**URL:** http://localhost:3000

### PROD server

```shell
npm run build && npm run start
```

**URL:** http://localhost:3000