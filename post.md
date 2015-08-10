I’ve been teaching myself Gulp recently. I found the basics easy to pick up. Although I didn’t consider myself a Grunt expert, I’d taught myself Grunt previously and that helped with me with Gulp.

Before we go further, check out the GitHub repository that contains the finished example project we'll go over here: [https://github.com/johnfmorton/using-gulp-htmlprocess-example](https://github.com/johnfmorton/using-gulp-htmlprocess-example "johnfmorton/using-gulp-htmlprocess-example")

One thing I have seen in both Grunt and Gulp workflows I've used from their repositories was a script code block that looks like the following.

    <!-- build:js allscripts.min.js -->
      <script src="script1.js"></script>
      <script src="script2.js"></script>
      <script src="script3.js"></script>
    <!--/build-->

This is a really cool block of code.

During your development loading in this HTML file, three separate script files would be loaded into your page. These individual script files help break up your code into more managible chunks. 

The comment tags surrounding the 3 script tags give a hint as to what's going to happen when using the Grunt or Gulp workflow. You would type in something like `gulp processfiles` and your workflow would take the HTML file and do various types on it and output a set production ready files. 

In the process those three separate script includes would be concatenated and minified into a single script file and the HTML itself would be altered to use the included for only the minified file. It's magic.

I had seen this set up workflows other people had created but recently I've been working on my own custom workflow for project I am doing. I wanted a similar concatenate/minify process in my own files. The trouble was I didn't know how to do this after reading the documentation for the various Gulp plug-ins I was using. Sometimes I find the documentation a little dry. 

Luckily, I've got it working now so I thought I would document what I did in case it helps others get this working. By others, I'm including myself, because I assume I will stumble upon this post at a later date when I'm searching for this solution again.

First of all, I'm only referencing Gulp as I go through this, but this post can be applied to Grunt fairly easily because Grunt, like Gulp, is just javascript. 

So, given that this is going to be a Gulp workflow we have a number of plug-ins to add. Each [Gulp plug-in](http://gulpjs.com/plugins/ "Gulp plugin directory") is used for a discrete piece of functionality; it is kept intentionally single-focused. That is why you sometimes have what might *seem like* a large number of plugins when you wan to accomplish fairly tasks.

In terminal, start by making your package file.

`npm init`

You can just use the defaults or modify them as you see fit. I end up with a **package.json** file that looks like this.


    {
      "name": "gulp-htmlprocessing-example",
      "version": "0.0.1",
      "description": "Sample project for Gulp HTML Processing",
      "main": "gulpfile.js",
      "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
      },
      "author": "John Morton",
      "license": "ISC"
    }


Now install the **gulp** module:

`npm install gulp --save-dev`

Then install **gulp-processhtml**:

`npm install gulp-processhtml --save-dev`

Then install **gulp-concat**:

`gulp-concat`

Lastly, we'll install **del**, which is short for *delete*. It's not a Gulp plugin, but a more basic node module. (See the Gulp doc for specifics on using *del* [here](https://github.com/gulpjs/gulp/blob/master/docs/recipes/delete-files-folder.md 'Delete files and folders').)

`npm install del --save-dev`

Now your **package.json** file should basically look like this:

    {
      "name": "gulp-htmlprocessing-example",
      "version": "0.0.1",
      "description": "Sample project for Gulp HTML Processing",
      "main": "gulpfile.js",
      "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
      },
      "author": "John Morton",
      "license": "ISC",
      "devDependencies": {
        "del": "^1.2.0",
        "gulp": "^3.9.0",
        "gulp-concat": "^2.6.0",
        "gulp-processhtml": "^1.1.0"
      }
    }

You will now also have a new directory called **note_modules**. It will contain the things we have just installed.

To make this test project work, we need a very basic HTML page built. It's part of the github repository that I've created for this post, but here's the basic structure of the files we need:

    dev
    ├── index.html
    ├── script1.js
    ├── script2.js
    └── script3.js

At a minimum, the index.html file will need to have the script tag mentioned at the beginning of this article. The script#.js files can each have a console.log message in them. 

Now it is time to create your gulpfile.js. You may do this from within the terminal by typing `touch gulpfile.js` and hitting enter. Open this file up in your text editor. 

Let's get all the modules we've installed stored in variables at the top of our *gulpfile.js*.

    // dependencies
    var gulp = require('gulp');
    var processhtml = require('gulp-processhtml');
    var concat = require('gulp-concat');
    var del = require('del');

Now, let's write our first Gulp task and name it "processhtml".

    gulp.task('processhtml', function() {
        // remove existing replacementlist.txt & dist folder if they exist
        del([
            'replacementlist.txt',
            'dist'
        ])

        /* options for processhtml */
        var options = {
            list: "replacementlist.txt"
        };

        return gulp.src('dev/index.html')
            .pipe(processhtml(options))
            .pipe(gulp.dest('dist'));
    });

Now, let's test what we've got so far.

`gulp processhtml`

You should see a new **dist** folder was created and it contains a single file, *index.html*. It's contents should be identical to the *index.html* file in your 'dev' folder except in the script area. The lines that imported the 3 individual script files into your original *index.html* have been replaced with a single line that imports only a single script file, *allscripts.min.js*. That's cool, but there is no *allscripts.min.js* there yet.

We need to get a list of the files that were replaced. In the *processhtml* call we made, we passed in an option to generate just such a list. It's stored in the file *replacementlist.txt* will will be created in the same directory as your *gulpfile.js*. You should see it there now. Take a look at the contents of this file. It looks something like this:

`
/Users/username/Documents/myproject/dev/index.html:script1.js
/Users/username/Documents/myproject/dev/index.html:script2.js
/Users/username/Documents/myproject/dev/index.html:script3.js
`

On the right hand side of each line the files that were replaced are listed. Preceding the name of each file is a `:` and the full path to the file that this generated this replacement. This path information would be useful if you were processing a bunch of files in a single operation. We're dealing with a single file here, *index.htmel*, so we don't need to worry about that.

We need to take this list and pick out the file names we need to concatenate. This is a job for a regex. Our regex will go through each line and find the colon and the remaincharacters in each line. 

The regex for this is `:.+`. Regex can be tricky to understand so let's go through this piece by piece. 

1. The `:` finds the colon character.
2. The `.` matches any single character except a new line character after the colon we just found.
3. The `+` causes the previous selection, the period that is matching any single character, to be matched repeatedly as many times as possible and for the selction to be as large as possible. That means it will keep matching characters until it gets to the new line character. 
 
Now we need to use this regex in a javascript `match` function to go through the list of files, and `map` each new file name into an array and store it in a variable we'll call `files`. Also, during that `map` process, we'll replace the `:` with the path, `dev/`, where these local files are stored within our project.

    var files = fileList.match(/:.+/ig).map(function(matched) {
        // replace ':'' with 'dev/'
        return matched.replace(/:/, 'dev/');
    });

If you look at the regex again, you might wonder how we got from `:.+` to `/:.+/ig`. The `/` characters simply indicate the start and end of the regex expression. The `i` means 'ignore case'. In other words, it will treat caps and lowercase letters the same. The `g` means global, do this operation on the whole file. (See [Mozilla's artice on regex flags](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions?redirectlocale=en-US&redirectslug=Core_JavaScript_1.5_Guide%2FRegular_Expressions#Advanced_searching_with_flags).)

Now we've got an array of the files we want to replace in a variable called `files`. We can pass this variable into the `concat` task to concatenate these files together in the 'dist' folder.

    return gulp.src(files)
      .pipe(concat('alerts.min.js'))
      .pipe(gulp.dest('./dist/'));

Putting it all together, here's what the `conact` task looks like:

    gulp.task('concat', ['processhtml'], function() {
        // Try to read the replacementlist.txt file.
        try {
            var fileList = require('fs').readFileSync('replacementlist.txt', 'utf8');
            // remove the  replacementlist.txt because we're done with it
            del([
                'replacementlist.txt'
            ])
        } catch (e) {
            // If there was an error, it's probably  because the file wasn't there.
            console.error(e);
            // stop running this function
            return;
        }
        // we match a regex against the 'fileList' and map
        // the results back to an array called 'files'
        var files = fileList.match(/:.+/ig).map(function(matched) {
            // for each matched item (ie each line)
            // replace the ':'' with 'dev/'
            return matched.replace(/:/, 'dev/');
        });

        console.log("Files to be replaced:", files);

        return gulp.src(files)
            .pipe(concat('alerts.min.js'))
            .pipe(gulp.dest('./dist/'));
    });

You'll see I added a few extra things in here that I haven't mentioned so far. First, the first line (`gulp.task('concat', ['processhtml'], function() {`) includes an extra parameter for the *processhtml* task. This is a way of telling Gulp that the *concat* task is dependent on the *processhtml* task to have been run. 

I also included another *del* statement in there to get rid of the *replacementlist.txt* file we used to temporarily store the list of files we wanted to concatenate. You're an adult, after all, and you're cleaning up after yourself is important.

To wrap all of this up in a bow, let's make the default Gulp task run these tasks in order.

    gulp.task('default', ['processhtml','concat']);

With this line in your *gulpfile.js*, you can simply type in `gulp` at the command line at the root of your project and it will do all these tasks for you.

So where do you go from here? Obviously this is not a complete project. I'm simply trying to isolate the creation of a single task.

### Where to go from here.

You would also want to actually minify the contents of your JavaScript file that you concatenated in your distribution folder. Also, for just simple development ease of use, you'd probably want to set up a server to serve the files in your development folder as you work on them. Then, you'd probably want to set up a watch task to monitor files in your development folder to trigger a live reload of your browser window as you work on most of the files.