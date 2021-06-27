#!/usr/bin/env node
const fs=require("fs");
const path=require("path");
const types=
{
    media:["mp4","mkv"],
    archives:["zip","rar","tar","7z","gz","ar","iso","xz"],
    documents:["docx","doc","pdf","xlsx","xls","odt","ods","odp","odg","odf","txt","ps","tex"],
    app:["exe","dmg","pkg","deb"],
    images:["png","jpg","gif","webp"],
    code:["cpp","java","py","c","r","js","html","css","scss"]
}

const treeFn=(directoryPath)=>
{
    if(directoryPath==undefined)
    {
        directoryPath=process.cwd();
    }
    if(fs.existsSync(directoryPath))
    {
        treeHelper(directoryPath,"");
    }
    else
    {
        console.log("Please provide a valid path");
    }
}

function treeHelper(directoryPath,indent)
{
    const isFile=fs.lstatSync(directoryPath).isFile();
    if(isFile)
    {
        const fileName=path.basename(directoryPath);
        console.log(indent+" |---> "+fileName);
    }
    else
    {
        const dirName=path.basename(directoryPath);
        console.log(indent+" |____ "+dirName);
        let childNames=fs.readdirSync(directoryPath);
        for(let i=0;i<childNames.length;i++)
        {
            let childPath=path.join(directoryPath,childNames[i]);
            treeHelper(childPath,indent+"\t");
        }
    }
}

// Function that will organize all the files in the directory
const organizeFn=(directoryPath)=>
{
    // if user hasn't provided any path then ask the user to provide a path and return
    if(directoryPath==undefined)
    {
        directoryPath=process.cwd();
    }
    let destinationPath;
    // then check if the directory provided by the user , exists or not.
    if(fs.existsSync(directoryPath))
    {
        // Take a new directory with the name "organized_files" 
        destinationPath=path.join(directoryPath,"/organized_files");
        // if there was no directory with the name "organized_files" then create a new one.
        if(!fs.existsSync(destinationPath))
        {
            fs.mkdirSync(destinationPath);
        }
    }
    else
    {
        console.log("Please provide a valid path.");
        return;
    }
    organizeHelper(directoryPath,destinationPath);
}

function organizeHelper(src,dst)
{
    // first of all get all the files and directories inside the given directory 
    let childNames=fs.readdirSync(src);

    // then traverse through the childs 
    for(let i=0;i<childNames.length;i++)
    {
        let childAddress=path.join(src,childNames[i]);
        
        // lstat returns an object from which we can detect whether the content is file or a folder
        let isFile=fs.lstatSync(childAddress).isFile();

        // if the content is a file then get the category of the file to which it belongs
        if(isFile)
        {  
            let category = getCategory(childNames[i]);
            sendFiles(childAddress,dst,category);
        }
    }
}

// This function returns the category of a file given. Category can be document or images or app  etc.
function getCategory(name)
{
    let ext=path.extname(name);  // get the extension name of the file 
    ext=ext.slice(1);   // as the extension name will have a dot(.) at the front we need to slice it.

    // traverse thorugh all the types and check whether the extension name matches with any subfield in any category or not
    for(let type in types)
    {
        const currentCategory=types[type];
        for(let i=0;i<currentCategory.length;i++)
        {
            // if we've found a match for the extension then return the category
            if(ext==currentCategory[i])
            {
                return type;
            }
        }
    }
    // if the file extension doesn't match with any category then return a default category "others"
    return "others";
}

function sendFiles(srcFilePath,dst,category)
{
    const categoryPath=path.join(dst,`/${category}`);
    // Check whether the category directory exists or not. If not then make the category directory 
    if(!fs.existsSync(categoryPath))
    {
        fs.mkdirSync(categoryPath);
    }

    // We need to copy the file from source to destination. For that we'll create path to a file having 
    // same name as the srcFile
    const fileName=path.basename(srcFilePath);
    const newFilePath=path.join(categoryPath,fileName);

    // copy the content of the file from source to destination
    fs.copyFileSync(srcFilePath,newFilePath);

    // once a file has been copied successfully , remove the original file 
    fs.unlinkSync(srcFilePath);
    console.log(fileName+" has been organized successfully");
}


const helpFn=()=>
{
    console.log(`1.. Type "imran tree" to get the tree structure of any directory`);
    console.log(`2.. Type "imran organize" to organize the content of any directory`);
}

const inputArr=process.argv.slice(2);
switch(inputArr[0])
{
    case "tree":
        treeFn(inputArr[1]);
        break;
    case "organize":
        organizeFn(inputArr[1]);
        break;
    case "help":
        helpFn();
        break;
    default:
        console.log("Please provide a valid command");
        break;
}