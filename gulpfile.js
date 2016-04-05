var gulp = require('gulp');
var jade = require('gulp-jade');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var csso = require('gulp-csso');
var watch = require('gulp-watch');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var notify = require('gulp-notify');
var autoprefixer = require('gulp-autoprefixer');
var imagemin = require('gulp-imagemin');
var newer = require('gulp-newer');
var size = require('gulp-size');
var jshint = require('gulp-jshint');
var html5Lint = require('gulp-html5-lint');
var watch = require('gulp-watch');
var spritesmith = require('gulp.spritesmith');
var browserSync = require('browser-sync').create();
var merge = require('merge-stream');
var buffer = require('vinyl-buffer');

var BOWER_FOLDER = './bower_components/',
    IMG_SRC = 'src/images/**',
    IMG_DEST = 'build/images';

// BrowserSync
gulp.task('serve', ['compile_all'], function() {
  browserSync.init({
    ui: false,
    server: {
      baseDir: "./build",
      directory: true
    }
  });

  watch('./src/jade/**/*.jade', function() {
    gulp.run('jade');
  });

  watch('./src/sass/**/*.scss', function() {
    gulp.run('sass');
  });

  watch('./src/sprite/**/*.png', function() {
    gulp.run('sprite');
  });

  watch('./src/js/main.js', function() {
    gulp.run('copyJs');
  });

  watch('./scripts.js', function() {
    browserSync.notify("<strong>Scripts</strong> has been updated. You need to run gulp again.");
    console.log('Scripts has been updated. You need to run gulp again.');
  });

  gulp.watch(IMG_SRC, ['images']);

  gulp.watch('./build/*.html').on('change', browserSync.reload);
  gulp.watch('./build/js/*.js').on('change', browserSync.reload);
});

gulp.task('bs-reload', function () {
  browserSync.reload();
});

// Jade
gulp.task('jade', function() {
  browserSync.notify("<strong>Jade</strong> is changed");
  gulp.src(['./src/jade/*.jade', '!./src/jade/_*.jade'])
    .pipe(plumber())
    .pipe(jade({
      pretty: true
    }))
    .on('error', function(err) {
      browserSync.notify("<strong>FAIL:</strong> Jade");
      console.log('JADE ERROR: ' + err);
    })
    .pipe(size({title: 'html'}))
    .pipe(gulp.dest('./build/'));
});

// Sass
gulp.task('sass', function () {
  browserSync.notify("<strong>SASS/SCSS</strong> is changed");
  gulp.src('./src/sass/style.scss')
    .pipe(sourcemaps.init())
    .pipe(plumber({
      errorHandler: function (error) {
        browserSync.notify("<strong>FAIL:</strong> Sass");
        console.log('SASS ERROR: ' + error.message);
        this.emit('end');
    }}))
    .pipe(sourcemaps.write())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sass())
    .pipe(autoprefixer('last 2 versions'))
    .pipe(csso())
    .pipe(size({title: 'styles'}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./build/css'))
    .pipe(browserSync.stream());
});

gulp.task('copyJs', function() {
  gulp.src(['./src/js/main.js'])
    .pipe(gulp.dest('./build/js'))
    .pipe(size({title: 'main.js'}));
});

// Image minify
gulp.task('images', function() {
  browserSync.notify("Processing images...");
  console.log('Processing images...');
  gulp.src(IMG_SRC)
    .pipe(newer(IMG_DEST))
    .pipe(imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest(IMG_DEST))
    .pipe(size({title: 'images'}));
});

gulp.task('sprite', function () {
  var spriteData = gulp.src('./src/sprite/*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    retinaImgName: 'sprite@2x.png',
    retinaSrcFilter: ['./src/sprite/*@2x.png'],
    cssName: '_sprite.scss',
    padding: 2,
    imgPath: '../images/sprite/sprite.png',
    retinaImgPath: '../images/sprite/sprite@2x.png'
  }));

  var imgStream = spriteData.img
    .pipe(buffer())
    .pipe(imagemin())
    .pipe(gulp.dest(IMG_DEST + '/sprite'));

  var cssStream = spriteData.css
    .pipe(gulp.dest('./src/sass/'));

  return merge(imgStream, cssStream);
});


// Scripts concat
gulp.task('scripts', function() {
  var source = require('./scripts')(BOWER_FOLDER);
  console.log('Scripts: ' + source.length);
  if(source.length < 1) {
    return false;
  }
  else 
    return gulp.src(source)
      .pipe(concat('scripts.js'))
      .pipe(rename({suffix: '.min'}))
      .pipe(uglify({preserveComments: 'some'}))
      .pipe(gulp.dest('./build/js/'))
      .pipe(size({title: 'scripts'}));
});

gulp.task('fonts', function() {
  gulp.src(['./bower_components/font-awesome/fonts/**/*.{ttf,woff,eof,svg,otf,woff2}', './src/fonts/**/*.{ttf,woff,eof,svg,otf,woff2}'])
    .pipe(gulp.dest('./build/css/fonts'))
    .pipe(size({title: 'fonts'}));
});

gulp.task('compile_all', function() {
  gulp.run('jade');
  gulp.run('sass');
  gulp.run('scripts');
  gulp.run('images');
  gulp.run('sprite');
  gulp.run('copyJs');
});

gulp.task('jshint', ['copyJs'], function() {
  return gulp.src('./build/js/main.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('htmllint', function() {
  return gulp.src('./build/*.html')
    .pipe(html5Lint());
});

gulp.task('default', ['serve']);