# @ijstech/plugin
## Usage
### Step 1: Create a new folder
```sh
mkdir demo
cd demo
```
 
### Step 2: Initialize a worker/router plugin
```sh
npx @ijstech/plugin init <worker/router> <name>
e.g.: npx @ijstech/plugin init worker @scom/demo1
```
 
### Step 3: Install package dependencies
```sh
npm i
```
or
```sh
docker-compose up install
```

### Step 4: Run unit test
```sh
npm run test
```
or
```sh
docker-compose up test
```
### Step 5: Build plugin
```sh
npm run build
```
or
```sh
docker-compose up build
```
