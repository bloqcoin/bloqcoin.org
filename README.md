# Bloqcoin.org

Run `npm i` to download all the dependecies

Now recursively bundle up all the required modules, images and files to ./dist with the command :
`npm run build`

You can instruct webpack to "watch" all files within your dependency graph for changes. If one of these files is updated, the code will be recompiled so you don't have to run the full build manually :
`npm run watch`

In another shell you can start dev mode using nodemon :
`npm run dev`

# To compress and combile install webpack globally

npm install -g webpack