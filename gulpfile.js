// dependencies
var gulp = require('gulp');
var processhtml = require('gulp-processhtml');
var concat = require('gulp-concat');
var del = require('del');

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
        .pipe(concat('allscripts.min.js'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('default', ['processhtml', 'concat']);
