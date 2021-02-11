# @ijstech/node
## Secure Node Server

Node.js is one of the most popular application frameworks in use today especially in cloud and web-based applications.  A typical Node.js application may contain hundreds or thousands of 3rd party developed npm packages. These NPM packages enable developers to be extremely productive in developing solutions and it is a key reason why the use of Node.js is so attractive to developers. However, in a traditional Node.js implementation, these NPM packages come at a security cost.

In a traditional Node.js architecture, each of the NPM packages are allowed access to local server resources including sensitive capabilities such as uploading and downloading external files. As NPM packages are updated, security issues can be introduced to compromise the system.  According to this study (https://www.zdnet.com/article/hacking-20-high-profile-dev-accounts-could-compromise-half-of-the-npm-ecosystem/), it would only take the hacking of 20 high-profile dev accounts to compromise half of the npm ecosystem. Thus, using npm packages, the traditional way will expose the applications to security risks that cannot be tolerated in mission critical systems.

@ijstech/node allows developers to use NPM packages with fewer concerns as logic runs on isolated VMs.  @ijstech/node is also a complete secure application development framework featuring the following:

- A default 
secure server which supports SSL protocol by default, and using only minimum set of code reviewed npm packages
- An isolated VM which creates a completely isolated runtime environment for application logics: 
  - each VM instance runs on separate thread
  - restrict the code from accessing server resources (e.g. open new ports, access local files etc)
  - set memory limits / safe against heap overflow DoS attacks
  - set CPU limits, release the VM instance if runtime duration exceeds the limit
- A bunch of packages (https://www.npmjs.com/org/ijstech) which is using the VM security model to wrap third-party npm packages to provide common functionalities in a secure way
