# wessels.nz platform website & api

## Overview

This is the platform website and api for the wessels.nz platform.

The goal is to use the same code to achieve
- a PWA (progressive web app)
- a SPA (single page application) that can be serverless and hosted on a CDN
- a SSR (server-side rendered) app with SEO (search engine optimization) support
- a serverless SSR (running in AWS Lambda and static resources in AWS S3)

### Latest and greatest

#### preact v7

`preact` is `react` in only `3kB`

We also added `preact-compat` in case you need it, otherwise just get rid of it.

#### react-router v4

Routing done right with components. `ConnectedRouter` on the client and `StaticRouter` on the server
allow for perfect isomorphic routing.

#### redux v3 and ramda

Single immutable state, reducers and actions to structure and master even the biggest apps.

Use `rambda` to mutate state - this allows your state to be POJO (Plain Old JavaScript Objects)
and make development so much more fun.

#### rxjs v5

Reactive programming of your actions allows for easy composition of even the most complex
async action stream flows.
This can replace all the other redux middleware you used so far.
 
#### react-intl v2

Internationalization that uses standards and works client and server-side.
With support for all the stuff you need like genderization, pluralization, date and time.

There are even some helper scripts to export/import PO files to communicate with your translators.

##### `npm run po:export`

This will extract all translations from your code and merge them into PO files.
It will NOT override already existing translations but only add new translations to the PO files.
You then send the PO files to your translator and he will use his tools to only translate the new untranslated translations.

##### `npm run po:import visa`

This will import all translations from the PO files within the given whitelabel.
You do this after you received all translations back from the translator and before you build.

##### Whitelabel

If you are building just for your own company, then just have only a single whitelabel and that's totally fine.

But we also want to enable you to build for multiple whitelabels.
This allows you to have different translations for different whitelabels.
It is a very common thing in enterprise applications and translations really differ between whitelabels (believe me).

#### webpack v2 with HMR (hot module replacement)

Obviously the latest and greatest webpack with all the bells and whistles to achieve
highly optimized builds.

#### server-side rendering without the need for `preact-render-to-string`

With a huge thanks to @developit we can now run the preact app on the server without the need
for complex pre-render state calculations and render-to-string.

This gives us very clean code that is almost identical on server and client-side and performs
great.

You can find [all the details here](https://github.com/developit/preact-render-to-string/issues/30#issuecomment-288752733).

#### PWA (progressive web app) Service Worker

100/100 Lighthouse rating if you decide to use this repo to build a PWA.

Otherwise just get rid of the service worker at the end of `index.client.js`.

#### preact-mdc (material design components)

Isomorphic modular lightweight preact material design based on the [material-components-web](https://github.com/material-components/material-components-web) sass styles.

Replace it with your own front-end components if you like. Just make sure they are isomorphic.

#### Normalized GraphQL Entity Redux State

You can replace this easily with whatever data fetching technology you like but we really
encourage you to embrace GraphQL.

If you are using `GraphQL` and `Redux` you are most likely to normalize any `GraphQL Query`
into a `normalized entity store`.

To make this as simple and easy to use as possible we provide a script that can extract all
`GraphQL Entities` from a given `GraphQL Endpoint` and automatically create the `Entity Reducers`
for you.

You run this script initially and then whenever the `GraphQL Schema` is about to change.

##### Usage

###### Override

If you don't make any manual changes to any of the `Entity Reducers` you can just run

`npm run graphql:override`

This will generate and override your `Entity Reducers` automatically and you are ready to go.

###### Merge

If you are extending the `Entity Reducers` with additional functionality you must run

`npm run graphql:merge`

This will generate all the `Entity Reducers` in the `scripts/graphql/generated` folder.

You can now manually merge the generated

`...Reducer.js` files into `src/entities`

and
 
 `types.json` file into `src/graphql`

without losing any of the extensions you've previously added to the `Entity Reducers`.

## Getting started

#### npm run-commands in `package.json`

You might want to change the following parameters within the dev and build run-commands:

- `BASEURL` will be injected into the `index.html` and the `router history`
- `PORT` is the port to be used by the  development server
- `HOST` is the host to be used by the  development server
- `RESOURCEPATH` is the `AWS CloudFront Cache Behaviour Path Pattern` used for the static resources
 which are served from the `AWS S3 bucket`.

#### SSL

You can run development with `http` or `https`. Production is served only with `https`.

To do so you have to provide your own SSL certificates as `certificates/domain.key` and `certificates/domain.cert`.

Make sure you don't check those in to GIT!!!

### Development

`npm run dev` runs the development version via `http`

`npm run dev:secure` runs the development version via `https` in which case you have to provide
 your own ssl certificate in the `certificates` folder.

### Production

`npm run build`

`node dist/server/main`

This serves via https and requires you to provide your own certificates since it is intended to be for production.

### Server Side Rendering (SSR)

The server will only render and serve the site to the client when the `ROOT_STATE_READY_TO_RENDER` action has been dispatched.

This example dispatches this action once the first `GraphQL Query` had a successful response.

You can replace that easily with your own custom logic. Just make sure you dispatch the `ROOT_STATE_READY_TO_RENDER` action
when you are ready to render and serve the site to the client.

### Serverless SSR on AWS

To build for a real serverless SSR just run `npm run build:serverless`

- This will give you a `client` folder.
  - Create a `S3` bucket that will host your `static resources`.
  - Create a subfolder called `_` within that bucket.
  - Copy everything within the `client` folder into the `_` subfolder in the `S3` bucket.
- This will also give you the server files.
  - Create a `Lambda` function.
  - Zip the `index.js` and `client` folder together into an archive and upload it into your `Lambda` function.
- Copy the zip file as `bundle.zip` into the [Live Infrastracture Project](https://github.com/wessels-nz/infrastructure-live/tree/master/prod/wessels.com/Lambda/PlatformApiWebsite)
  - Run `terraform apply` to upload and update the `Lambda Function` with the new website and api.
- Upload the entire contents of the `client folder` to the `S3 bucket` into the `_` folder.

Now the new page is published and deployed.

In the future the `infrastructure live` project will most likely get `npm scripts` to automate this process.

# Contributing

You are very welcome to report issues, PRs and become a contributor.
