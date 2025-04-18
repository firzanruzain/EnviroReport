<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a id="readme-top"></a>
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![project_license][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]
[![wip-badge]][wip-url]


<!-- PROJECT LOGO 
<br />
<div align="center">
  <a href="https://github.com/firzanruzain/EnviroReport">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a> -->

<h3 align="center">EnviroReport</h3>

  <p align="center">
    A full-stack mobile app for reporting and managing environmental incidents, built for government use with React Native, Supabase, and Firebase.
    <br />
    <a href="https://github.com/firzanruzain/EnviroReport"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/firzanruzain/EnviroReport">View Demo</a>
    &middot;
    <a href="https://github.com/firzanruzain/EnviroReport/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/firzanruzain/EnviroReport/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <!-- <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li> -->
    <li><a href="#contact">Contact</a></li>
    <!-- <li><a href="#acknowledgments">Acknowledgments</a></li> -->
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

<!-- [![Product Name Screen Shot][product-screenshot]](https://example.com) -->

EnviroReport is a full-stack mobile application developed as a final year project, aimed at enhancing environmental incident tracking and management for government agencies—specifically the Department of Environment.

This platform allows public users to submit detailed reports of environmental issues, while enabling staff and administrators to manage, review, and respond to these reports efficiently through a dedicated admin interface.

## 🔧 Features

### 👥 General (All Users)
- User Registration & Login – Secure signup and login system for all users.
- Profile Management – Edit and update personal profile information.

### 🌍 Public User
- User Dashboard – View number of submitted reports and quick access to actions.
- Submit Incident Report – Report environmental issues with details, category, and location pinning on a map.
- Report History – View and track the status of submitted reports in both list and map views.
- Report Details – View full details of individual reports, including attachments and status updates.

### 🛠 Staff Division
- Division Dashboard – Overview of reports relevant to the division, including unresolved reports and recent activity.
- Report Management – View, filter, and update report statuses (e.g., Open, Pending, Closed).
- Form Management System
  - Create New Form – Design custom reporting templates using drag-and-drop fields.
  - Edit/Update Forms – Modify published or saved form templates.
  - Delete Forms – Remove obsolete forms from the system.
  - View Published & Existing Forms – Review all available form templates and manage publication status.
  - Form Feedback – Send feedback or comments on submitted reports.

### 🗂 System Enhancements
- Dynamic Form Builder – Supports highly customizable templates for different incident types.
- Real-time Status Updates – Reports update in real time for quick staff response.
- Map Integration – Location-based data shown visually for easier resource planning.
- Notifications – Keep users informed on their report status (optional: via push/email, depending on implementation).


<p align="right">(<a href="#readme-top">back to top</a>)</p>



###  Built With

* [![React Native][ReactNativeBadge]][ReactNative-url]
* [![Expo][ExpoBadge]][Expo-url]
* [![TypeScript][TypeScriptBadge]][TypeScript-url]
* [![NativeWind][TailwindBadge]][Tailwind-url]
* [![Firebase][FirebaseBadge]][Firebase-url]
* [![Supabase][SupabaseBadge]][Supabase-url]
* [![Figma][FigmaBadge]][Figma-url]
* [![GitHub][GitHubBadge]][GitHub-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Get a free API Key at [https://example.com](https://example.com)
2. Clone the repo
   ```sh
   git clone https://github.com/firzanruzain/EnviroReport.git
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Enter your API in `config.js`
   ```js
   const API_KEY = 'ENTER YOUR API';
   ```
5. Change git remote url to avoid accidental pushes to base project
   ```sh
   git remote set-url origin firzanruzain/EnviroReport
   git remote -v # confirm the changes
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

Use this space to show useful examples of how a project can be used. Additional screenshots, code examples and demos work well in this space. You may also link to more resources.

_For more examples, please refer to the [Documentation](https://example.com)_

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- [ ] Feature 1
- [ ] Feature 2
- [ ] Feature 3
    - [ ] Nested Feature

See the [open issues](https://github.com/firzanruzain/EnviroReport/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE 
## License

Distributed under the project_license. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
-->


<!-- CONTACT -->
## Contact

Muhammad Firzan Ruzain bin Firdus - firzanruzain@gmail.com

Project Link: [https://github.com/firzanruzain/EnviroReport](https://github.com/firzanruzain/EnviroReport)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS 
## Acknowledgments

* []()
* []()
* []()

<p align="right">(<a href="#readme-top">back to top</a>)</p>
-->


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/firzanruzain/EnviroReport.svg?style=for-the-badge
[contributors-url]: https://github.com/firzanruzain/EnviroReport/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/firzanruzain/EnviroReport.svg?style=for-the-badge
[forks-url]: https://github.com/firzanruzain/EnviroReport/network/members
[stars-shield]: https://img.shields.io/github/stars/firzanruzain/EnviroReport.svg?style=for-the-badge
[stars-url]: https://github.com/firzanruzain/EnviroReport/stargazers
[issues-shield]: https://img.shields.io/github/issues/firzanruzain/EnviroReport.svg?style=for-the-badge
[issues-url]: https://github.com/firzanruzain/EnviroReport/issues
[license-shield]: https://img.shields.io/github/license/firzanruzain/EnviroReport.svg?style=for-the-badge
[license-url]: https://github.com/firzanruzain/EnviroReport/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/firzan-ruzain-bin-firdus/
[product-screenshot]: images/screenshot.png

<!-- Badge Icons & Links -->
[ReactNativeBadge]: https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[ReactNative-url]: https://reactnative.dev/

[ExpoBadge]: https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white
[Expo-url]: https://expo.dev/

[TypeScriptBadge]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/

[TailwindBadge]: https://img.shields.io/badge/NativeWind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white
[Tailwind-url]: https://www.nativewind.dev/

[FirebaseBadge]: https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black
[Firebase-url]: https://firebase.google.com/

[SupabaseBadge]: https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white
[Supabase-url]: https://supabase.com/

[FigmaBadge]: https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white
[Figma-url]: https://figma.com/

[GitHubBadge]: https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white
[GitHub-url]: https://github.com/

[wip-badge]: https://img.shields.io/badge/Status-Work_in_Progress-yellow?style=for-the-badge
[wip-url]: https://github.com/firzanruzain/EnviroReport
