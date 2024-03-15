# Release And Copy Tools App

The purpose of this app is two address mainly to main use cases:

1. Having the ability to bulk-add items to a release from a single entry, including all its references and all its locales.

1. Being able to copy an entry across its different locales, meaning that a copy of each localized version will be made as opposed to only copying the root locale. This process will only copy entries that have been localized, as unlocalized entries are replicas of their parent locale versions.

## Introduction

The application itself is built using NextJS and has two major areas, its front-end or visual UI and its back-end, a few services used to manage OAuth authentication and proxying requests to Contentstack's APIs, so the authentication credentials can be safely be passed without being exposed.

We will describe how the following items of the application are implemented from a high level perspective:

1. OAuth with Encryption and Application Storage
1. API Request Proxying
1. Application Configuration: Environment Variables

Moreover we will describe functionally how the two use cases are implemented and how the applications caters for those. We will go over the UI and the different options available to the users, explaining how to interact with the application and ensuring end users are comfortable using the provided functionality.

This document will consist of two major sections:

1. Developer Overview
1. User Guide

The developer overview section will describe the application architecture and its implementation from a more technical perspective, but it won't describe every single file or approach used to implement the different elements of the application. It's expected that the developers reading such section should have enough knowledge to navigate the code by themselves and are particularly familiar with React and NextJS, but also with the overall client-server and microservices concepts.

Additionaly, at the end of this document we will provide instructions on how to register the application on Developer Hub, run the application locally and test its logic. Additionally we will provide steps to host and run this application using Launch, too.

### Developer Overview

In this section we will describe the following concepts:

1. OAuth
2. API Proxying
3. Configuration

It is recommended that developers are familiar with NextJS's architecture and its relatively new app router implementation.

[NextJS Docs](https://nextjs.org/docs)

#### OAuth

The application implements the following [OAuth Workflow](https://www.contentstack.com/docs/developers/developer-hub/contentstack-oauth)

It relies on user tokens with specific scopes. Those scopes are restricted purely to the permissions strictly necessary to execute the different operations the application needs to run. More details about the specific scopes will be provided later on this readme in the **Registration and Local Development** section.

The OAuth workflow is implemented in the app under the `app/api/oauth` route in the application. In that folder you will find two sub-folders which contain two handlers (one each) to deal with either exchange the code provided by the Contentstack app endpoint, or to refresh an existing expired token.

Additionally these endpoints, will encrypt the credentials if the application is configured to do so. You can enable/disable encryption using the environment variables as described in the **Configuration** section later on this document.

These endpoints simply implement the OAuth workflow as described in the link provided above, and will only add encryption to the resulting credentials as needed.

##### Calling the OAuth endpoints from the application

Obviously, in order to authenticate via OAuth the application needs to interact with these back-end endpoints, this is done via a `AuthorizeButton` react component which will initiate the OAuth process. That button can be found in the following folder in the app:
`app/components/AuthorizeButton.tsx`.

The following UI is displayed to the user prior to their authentication (more details about how to access the app, will provided in the `User Guide` section at the end of this document):

![Security &  Storage](/readme-images/security-and-storage.png)

As can be seen in the `AuthorizeButton` file, the `onClick` event on that button initiates the OAuth workflow by calling the `authorizeUser()` method. That method will request a code for the registered app and will wait for a message to be sent back when that code is generated (see the `useEffect` hook with the following code: `window.addEventListener("message", receiveAuthToken);`)

Once the `code` is received it is sent to the `exchange-code` handler (`/app/api/oauth/exchange-code/route.ts`), the handler completes the exchange and returns the encrypted OAuth credentials.

Then the `AuthorizeButton` component, takes such information and stores it locally within the `AppStorage` by using the `useAuth` hook (`app/hooks/oauth/useAuth.ts`). You can also review the `useAppStorage` hook in this file for further details (`app/hooks/useAppStorage.ts`)

Once the exchange is completed, and the credentials are stored, the UI will display the Application's full UI as follows:

**Note:** You can always reset your credentials (i.e. removed any stored credential information by clicking the `Clear Data` button within the Security Section). That will force the users to re-authenticate.

Once the users are authenticated they get access to the following screen:

![First Time App Access](/readme-images/app-first-time.png)

Review the **User Guide** section below for details on how to use the app.

#### API Proxying

As mentioned before, the UI needs to communicate with Contenstack's API so the credentials are both encrypted and not available in the client.

For this purpose there's an `api` endpoint that receives these requests and send them to the Contentstack's endpoints appending the appropriate headers with the appropriate credentials.

The api in question can be found in the following route inside the project:

`/app/api/v3/[...slug]/route.ts`

The most relevant pieces of logic here are:

- Header Preparation
- Fetch Strategy

##### Header Preparation

The header preparation occurs in the `prepareHeaders` function available under `/app/api/helper.ts` and all it does is to ensure the appropriate headers area available in the request and those that are encrypted are decrypted in the server and sent to Contentstack's API.

[Prepare Header Function](/app/api/helper.ts)

##### Fetch Strategy

The proxy api relies also on a Fetch Strategy implemented in the following file:

`/app/utils/fetchPlus.ts`

As can be deducted from the code, this strategy makes the `fetch` calls and checks for 429 responses, which are generated when a limit on API calls is reached. For those responses, the strategy awaits for a given period of time and then retries. The await time and number of retries are configured in the environment variables with the following two variables:

```bash
NEXT_PUBLIC_CS_RETRY_INITIAL_DELAY=250
NEXT_PUBLIC_CS_MAX_REF_DEPTH=5
```

Please be aware tha the wait time is increased proportionally to the number of attempts being made, so on the first retry, the strategy awaits the configured value, in the example provided the retry would wait 250 milliseconds. If another 429 is received, then the strategy would wait 500 milliseconds before retrying, and so on and so forth.

If the maximum number of attempts is reached, then we return the response from Contentstack's API.

#### Registration and Local Development

In order to use the app, you first need to register it using Developer Hub. You will need to be a developer at the organization level to do so.
Once you have access to [Developer Hub](https://www.contentstack.com/docs/developers/developer-hub), The following steps describe how to get the application setup to run locally from the developer's computer:

1. Register you application in Developer Hub. Go to Developer Hub:

![Developer Hub](/readme-images/developer-hub-access.png)

1. Click hte **+ New App** button:

![New App Button](/readme-images/new-app-button.png)

1. Fill in the new app form and click the **Create** button:

![Create New App](/readme-images/new-app-form.png)

1. From the Basic Information page you can manage different data about your application, such as its name and icon.

1. The next step is to define the different UI locations. In our case we are going to define two of these locations. From the UI Locations section on the left panel, and under the **Available Locations** section, add an **App Configuration** location:

![Add App Configuration Location](/readme-images/app-configuration-add.png)

1. Then provide the following path `/locations/app-configuration`, then click the **Save** button:

![App Configuration Path](/readme-images/app-configuration-details.png)

1. Repeat this step to create a **Entry Sidebar** location, using this path `/locations/sidebar`. You will need to provide a Name too, which will be displayed in the entry sidebar widget dropdown in the user interface. Remember to **Save** the changes.

![Entry Sidebar Path](/readme-images/entry-sidebar-details.png)

1. Now, navigate to the Hosting Section on the left panel, notice how **Custom Hosting** is selected. Here you will need to provide an App Url, use `http://localhost:3009`. This is where developers can run this application locally. If you would run the application on a different host and/or port, make sure you use the appropriate values. Make sure you **Save** your changes.

![Hosting Details](/readme-images/hosting-details.png)

**Note:** we will describe how to use Launch to host this application so your users can use it without having to run the application locally.

1. Next we will configure OAuth. As mentioned before, this application relies on OAuth for authentication, and you will configure the appropriate settings in the OAuth section from the left panel within Developer Hub:

![OAuth Details](/readme-images/oauth-details.png)

1. In this section you will configure some settings that you will need available as environment variables later on for your application to run, please review the **Configuration** section to get a better understanding on what environment variables are required before running the application.

   - **Client ID**: this value is required for the OAuth authentication workflow. Make sure you keep a copy of its value.

   - **Client Secret**: this value is **not** required for the OAuth authentication workflow since we will be enable `PKCE`. More details below.

   - **Redirect URL**: this value is required for the OAuth authentication workflow. Make sure you keep a copy of its value. The value of this setting when running the application locally as described before should be `http://localhost:3009/locations/callback`. That's where the application is expecting the callback call from Contentsack's OAuth service.
   - The next configuration step is to define the OAuth Scopes for the User Token that will be generated as part of the OAuth authentication process. Make sure you add the following **User Token** scopes:

     - `cm.content-types.management:read` (content-type): View all content types.
     - `cm.content-type:read` (content-type): View content type details.
     - `cm.entries.management:read` (entry): View all entries
     - `cm.entries.management:write` (entry): Create, update, remove entries.
     - `cm.entry:read` (entry): View details associated with an entry.
     - `cm.entry:write` (entry): Update details associated with an entry.
     - `cm.entry:publish` (entry): Publish an entry.
     - `cm.assets.management:read` (asset): View all assets.
     - `cm.assets.rt:read` (asset): View all RTE assets.
     - `cm.assets.rt:write` (asset): Create, update, remove RTE assets.
     - `cm.environments.management:read` (environment): View all environments.
     - `cm.languages.management:read` (language): View all languages.
     - `cm.bulk-operations:publish` (bulk-operation): Publish bulk operations.
     - `cm.bulk-operations:add-to-release` (bulk-operation): Add to release bulk operations.
     - `cm.releases.management:read` (release): View all releases.
     - `cm.releases.management:write` (release): Create, update, remove releases.
     - `cm.release:read` (release): View details associated with a release.
     - `cm.release:write` (release): Update details associated with a release.
     - `cm.release:deploy` (release): Deploy a release.

   - **Allow PKCE**: this value is required for the OAuth authentication workflow. Make sure this setting is enabled after you define the scopes. To learn more about PKCE you can visit this [documentation link](https://www.contentstack.com/docs/developers/developer-hub/pkce-for-contentstack-oauth).

1. Next, save your changes.
1. Your application configuration is now completed and can be installed in any of your stacks. To do so, click the **Install App** button on the top right corner of your screen:

![Install the application](/readme-images/install-button.png)

1. Once you hit the install button you will need to select in which Stack you want to install the app. You will need to accept the terms of service.

![Install the application in a Stack](/readme-images/install-app-in-stack.png)

1. Ensure your application is running and properly configured (see **Configuration: Environment Variables** values below) before installing the app. In order to run the app you need to run the following two commands in the terminal from the application's root directory:

   - Using npm:

   ```bash
   #Install all packages dependencies
   npm install

   #Run the app
   npm run dev
   ```

   - Using yarn:

   ```bash
   #Install all packages dependencies
   yarn

   #Run the app
   yarn dev
   ```

- You can navigate to [http://localhost:3009](http://localhost:3009) to confirm the application is running. You should see something like this in your browser:

![Application Running](/readme-images/app-running.png)

1. Then click **Install**. You will be taken to the App Configuration location defined at the beginning of the registration process. As shown in that screen, there's nothing for you to do, as the configuration relies on the `.env` file solely for configuration.

![App Configuration](/readme-images/app-config-screen.png)

1. From that screen click **Save**, and navigate to any entry on your stack.

1. Open the Sidebar Widget section and you should see the authentication screen. After you authorize the app you will be able to see the apps UI. Please refer to the **User Guide** section for further details on how to use the different options in the application.

![Sidebar Widget](/readme-images/sidebar-widget.png)
![App UI](/readme-images/app-ui.png)

##### Configuration: Environment Variables

The application needs the following environment variables to run. When running locally you will need a `.env` file to store these values at the root level of the application. The content's of that file should contain the following environment variables:

```bash
#OAuth Client ID
NEXT_PUBLIC_CS_CLIENT_ID=your_app_client_id
NEXT_PUBLIC_APPLICATION_ID=your_application_id
NEXT_PUBLIC_REDIRECT_URL=http://localhost:3009/locations/callback


#OAuth Enable Encryption

#If you don't want to encrypt your credentials you can set this value to 'false'
NEXT_PUBLIC_CS_OAUTH_ENCRYPTION=true

CS_ENCRYPTION_KEY=your_encryption_key
#Example Encryption Key: 39n39343kfa0@#$#ka3294#$&*#&##%*##&@83832##@309f2nf2n20932ff2wsalksjhf38@#$@48


#LOG

#Set this value to 'true' to add more console.log verbose information both on the browser and server side.
NEXT_PUBLIC_NEXTJS_LOGS=false

## PUBLIC VARIABLES -----------------------------
#Hosts, these values are the currently available hosts for different services and regions, allowing the app to run in any of them/
NEXT_PUBLIC_CS_LAUNCH_HOST=http://localhost:3009
NEXT_PUBLIC_BASE_URL_NA=https://app.contentstack.com
NEXT_PUBLIC_API_NA=https://api.contentstack.io
NEXT_PUBLIC_BASE_URL_EU=https://eu-app.contentstack.com
NEXT_PUBLIC_API_EU=https://eu-api.contentstack.com
NEXT_PUBLIC_BASE_URL_AZURE_NA=https://azure-na-app.contentstack.com
NEXT_PUBLIC_API_AZURE_NA=https://azure-na-api.contentstack.com
NEXT_PUBLIC_BASE_URL_AZURE_EU=https://azure-eu-app.contentstack.com
NEXT_PUBLIC_API_AZURE_EU=https://azure-na-api.contentstack.com

#LIMITS
#These limits are plan specific, so make sure you understand what values you can use here.
NEXT_PUBLIC_CS_MAX_ENTRIES_PER_RELEASE=500
NEXT_PUBLIC_CS_MAX_ITEMS_AT_ONCE_PER_RELEASE=25

# The maximum attempt of retries when an api limit is hit.
NEXT_PUBLIC_CS_MAX_RETRIES=10

#This is the delay implemented to avoid 429 errors and what will be increased geometrically as the api identifies the need for retries (i.e. if we hit the API limits, the implementation will increase this waiting period )
NEXT_PUBLIC_CS_RETRY_INITIAL_DELAY=250
#This is the maximum number of nesting the application will try to recursively crawl for references.
NEXT_PUBLIC_CS_MAX_REF_DEPTH=5

#UI OPTIONS
#This value should be left as 'false'
NEXT_PUBLIC_CS_SHOW_LOAD_OPTIONS=false

```

1. In the next section we will describe how to host this application in Launch.

#### Hosting in Launch

In order to host this application in Launch, you will need to create a Launch Project, we will describe the steps to do so and how to appropriately configure the project for the app to run.

1. Navigate to Launch

![Launch Access](/readme-images/launch-access.png)

1. Click the **+ New Project** button on the top right corner.

![New Project Button](/readme-images/new-project-button.png)

1. You will be presented with two options, for this example we are going to use the **Upload a file** option. The process to connect the Launch Project to a git repository is straight forward and will not be covered in this readme file. For further details you can read the documentation about that topic [here](https://www.contentstack.com/docs/developers/launch).

1. Choose the **Upload File** option:

![Upload a File](/readme-images/launch-project-options.png)

1. You will need to create such a zip file. To do so, navigate to the root of your project and zip all the contents into a zip file, you should only include the following folders and files:

```bash
├── app
├── components
├── components.json
├── lib
├── next-env.d.ts
├── next.config.js
├── package.json
├── postcss.config.js
├── public
├── tailwind.config.js
└── tsconfig.json
```

1. Once you have compressed the folders and files above and you have a zip file, drag and drop it into the dialog provided by Launch:

![Drag & Drop](/readme-images/drag-and-drop.png)

1. Click **Next**:

![Click Next](/readme-images/click-next.png)

1. Provide a name for your project, and select `NextJs` for the framework preset, it will populate the default build options.

![Project Details](/readme-images/project-details.png)

1. Next let's add the Environment Variables. When hosting in launch you can managed the environment variables conveniently using the UI. Click on _Bulk Edit_ below and paste the environment variables in the **Key and Value** box (please remove all comments from the file prior to copying the values):

```bash
NEXT_PUBLIC_CS_CLIENT_ID=YOUR_CLIENT_ID_HERE
NEXT_PUBLIC_APPLICATION_ID=YOUR_APPLICATION_ID_HERE
NEXT_PUBLIC_REDIRECT_URL=http://localhost:3009/locations/callback
NEXT_PUBLIC_CS_OAUTH_ENCRYPTION=true
CS_ENCRYPTION_KEY=YOUR_ENCRYPTION_KEY_HERE
NEXT_PUBLIC_NEXTJS_LOGS=false
NEXT_PUBLIC_CS_LAUNCH_HOST=http://localhost:3009/
NEXT_PUBLIC_BASE_URL_NA=https://app.contentstack.com
NEXT_PUBLIC_API_NA=https://api.contentstack.io
NEXT_PUBLIC_BASE_URL_EU=https://eu-app.contentstack.com
NEXT_PUBLIC_API_EU=https://eu-api.contentstack.com
NEXT_PUBLIC_BASE_URL_AZURE_NA=https://azure-na-app.contentstack.com
NEXT_PUBLIC_API_AZURE_NA=https://azure-na-api.contentstack.com
NEXT_PUBLIC_BASE_URL_AZURE_EU=https://azure-eu-app.contentstack.com
NEXT_PUBLIC_API_AZURE_EU=https://azure-na-api.contentstack.com
NEXT_PUBLIC_CS_MAX_ENTRIES_PER_RELEASE=500
NEXT_PUBLIC_CS_MAX_ITEMS_AT_ONCE_PER_RELEASE=25
NEXT_PUBLIC_CS_MAX_RETRIES=10
NEXT_PUBLIC_CS_RETRY_INITIAL_DELAY=250
NEXT_PUBLIC_CS_MAX_REF_DEPTH=5
NEXT_PUBLIC_CS_SHOW_LOAD_OPTIONS=false
```

**Note:** We will need to update all references to `http://localhost:3009` once Launch gives us a host.

1. Next, hit deploy. The deployment process should start:

![Deployment Process](/readme-images/deployment-process.png)

1. Once the deployment is completed, you should see a success message as follows. Keep in mind this process will take a few minutes. The deployment is completed when you see this logs:

![Deployment Logs](/readme-images/deployment-logs.png)

1. You can copy the URL from there and open a web browser, you should see the application up and running there. And you should be able to see a preview/screenshot of the site too:

![URL and Preview](/readme-images/url-and-preview.png).

1. Next let's update all references to `http://localhost:3009` and use the newly created host: `https://copy--release-tools.contentstackapps.com`. You will need to update this value in:

   - **Developer Hub**: Navigate to Developer Hub, choose your application and change the hosting from **Custom Hosting** to **Hosting with Launch**, and choose the project you just created.

     ![Hosting With Launch](/readme-images/hosting-with-launch.png)

   **Note:** Make sure you save the changes.

   - Next, within Developer Hub, and under your Application Configuration, update the OAuth Redirect URL with the following value `https://copy--release-tools.contentstackapps.com/locations/callback`:

     ![Redirect URL](/readme-images/redirect-url.png)

   - Since the application configuration has changed, you will need to "update" the app in the stacks where it was previously installed. You can do that from the Marketplace section:

     ![Marketplace Access](/readme-images/marketplace-access.png)

   - Click on Manage up top, and notice how the **Release and Copy Tools** app shows a red circle indicating something has changed:

     ![App Update](/readme-images/app-update.png)
     ![Confirm Terms and Stack](/readme-images/confirm-terms-and-stack.png)

   - Click on your app and update it.

     ![Update App](/readme-images/update-app-in-stack.png)

     **Note:** You should see the configuration screen again, but this time this is being served from Launch. You can click **Save** and proceed to update Launch configuration next.

   - **Launch Project, Environment Variables**: Navigate to Launch, choose your project and access your settings.

     ![Launch Project Settings](/readme-images/launch-project-settings.png)

   - Next click on Environments, and then Environment Variables

     ![Update Environment Variables](/readme-images/update-environment-variables.png)

   - Locate the variable named `NEXT_PUBLIC_REDIRECT_URL` and update it with `https://copy--release-tools.contentstackapps.com/locations/callback`

   - Locate the variable named `NEXT_PUBLIC_CS_LAUNCH_HOST` and udpate it with `https://copy--release-tools.contentstackapps.com`

   - Click on **Save Environment Variables** at the bottom.

   - The last step, is to redeploy the Launch Project. To do so, simply:

     - Click the Environments section on the left panel

       ![Launch Environments](/readme-images/launch-environments.png)

     - Click the `Default` environment, and from the next screen, click **Redeploy**.

       ![Redeploy](/readme-images/redeploy.png)

     - You will need to re-upload the zip file and hit **Redeploy**

       ![Redeploy Confirmation](/readme-images/redeploy-confirmation.png)

     - Once the redeployment completes, you can go back to your Stack, choose an entry, and access the application. You should see the application up and running within the Sidebar Widget section. In the following section we will describe how the application can be used.

### User Guide

### Additional Resources

This section contain several useful documentation links:

- [Contentstack's Documentation](https://www.contentstack.com/docs)
- [Content Releases](https://www.contentstack.com/docs/content-managers/create-and-manage-releases/about-releases)
- [Launch](https://www.contentstack.com/docs/developers/launch)
- [Developer Hub](https://www.contentstack.com/docs/developers/developer-hub)
- [Marketplace](https://www.contentstack.com/docs/developers/marketplace-platform-guides/about-marketplace)
- [Marketplace E-Commerce Boilerplate App](https://www.contentstack.com/docs/developers/developer-hub/marketplace-ecommerce-app-boilerplate)
- [Marketplace DAM Boilerplate App](https://www.contentstack.com/docs/developers/developer-hub/marketplace-dam-app-boilerplate)
- [Automation Hub](https://www.contentstack.com/docs/developers/automation-hub-guides/about-automation-hub)
