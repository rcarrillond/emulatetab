/*global module:true, require:true */

(function(module, semver) {
    'use strict';

    module.exports = function(grunt) {

        grunt.initConfig({
            // TODO: put initialCopyrightYear someplace smarter?
            initialCopyrightYear: 2011,

            // TODO: put baseFilename someplace smarter?
            baseFilename: 'emulatetab.joelpurra',

            pkg: grunt.file.readJSON('package.json'),

            semver: semver,

            meta: {
                banner: ['/*!',
                    '* <%= pkg.title %> v<%= pkg.version %>',
                    '* <%= pkg.homepage %>',
                    '*',
                    '* Copyright © <%= _.range(initialCopyrightYear, new Date().getFullYear()+1, 1).join(", ") %> <%= pkg.author.name %>',
                    '* Developed by <%= pkg.contributors[0].name %> <<%= pkg.contributors[0].url %>>',
                    '* Released under the <%= _.pluck(pkg.licenses, "type").join(", ") %> license<%= pkg.licenses.length === 1 ? "" : "s" %>.',
                    '*',
                    '* <%= pkg.description %>',
                    '*/\n\n'
                ].join('\n'),
                microbanner: ['/*! <%= pkg.title %> v<%= pkg.version %>',
                    '© <%= _.range(initialCopyrightYear, new Date().getFullYear()+1, 1).join(", ") %> <%= pkg.author.name %>,',
                    'Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n'
                ].join(' ')
            },

            clean: {
                files: ['dist/', '.grunt/']
            },

            concat: {
                options: {
                    banner: '<%= meta.banner %>',
                    stripBanners: true
                },
                dist: {
                    src: ['src/<%= baseFilename %>.js'],
                    dest: 'dist/<%= baseFilename %>.js'
                }
            },

            uglify: {
                options: {
                    banner: '<%= meta.microbanner %>'
                },
                dist: {
                    src: ['<%= concat.dist.dest %>'],
                    dest: 'dist/<%= baseFilename %>.min.js'
                }
            },

            connect: {
                server: {
                    options: {
                        port: 8000,
                        base: '.'
                    }
                }
            },

            qunit: {
                all: {
                    options: {
                        urls: [
                            'http://localhost:8000/test/'
                        ]
                    }
                }
            },

            jshint: {
                src: [
                    'Gruntfile.js',
                    'src/**/*.js',
                    'test/**/*.js',
                    'example/**/*.js'
                ],
                options: {
                    jshintrc: '.jshintrc'
                }
            },

            jsonlint: {
                all: {
                    src: ['package.json', 'bower.json', 'emulatetab.jquery.json', 'composer.json', 'component.json']
                }
            },

            micro: {
                src: '<%= uglify.dist.dest %>',
                options: {
                    limit: 1024,
                    gzip: true
                }
            },

            copy: {
                'jekyll-site-theme': {
                    expand: true,
                    cwd: 'site/theme/',
                    src: [
                        '**',
                    ],
                    dest: '.grunt/jekyll/'
                },
                'jekyll-site-contents': {
                    expand: true,
                    cwd: 'site/contents/',
                    src: [
                        '**',
                    ],
                    dest: '.grunt/jekyll/'
                },
                'jekyll-site-code': {
                    expand: true,
                    src: [
                        'bower_components/qunit/qunit/qunit.css',
                        'bower_components/qunit/qunit/qunit.js',
                        'bower_components/jquery/jquery.js',
                        'dist/**',
                        'example/**',
                        'test/**'
                    ],
                    dest: '.grunt/jekyll/'
                }
            },

            jekyll: {
                options: {
                    src: '.grunt/jekyll/',
                    dest: '.grunt/site/',
                    safe: true
                },
                dist: {},
                test: {
                    options: {
                        doctor: true
                    }
                },
                serve: {
                    options: {
                        serve: true,
                        watch: true,
                        future: true,
                        drafts: true
                    }
                }
            },

            checkrepo: {
                tagged: {
                    tag: {
                        valid: '<%= pkg.version %>', // Check if pkg.version is valid semantic version
                    },
                    tagged: false, // Check if last repo commit (HEAD) is not tagged
                    clean: true, // Check if the repo working directory is clean
                },
                clean: {
                    clean: true // Check if the repo working directory is clean
                }
            },

            bump: {
                options: {
                    files: ['package.json', 'bower.json', 'emulatetab.jquery.json', 'composer.json', 'component.json'],
                    updateConfigs: ['pkg'],
                    commit: false,
                    commitMessage: 'v%VERSION%',
                    commitFiles: '<%= bump.options.files %>', // '-a' for all files
                    createTag: false,
                    tagName: 'v%VERSION%',
                    tagMessage: 'v%VERSION%',
                    push: false,
                    gitDescribeOptions: '--tags --always --dirty=-SNAPSHOT' // options to use with '$ git describe'
                }
            },

            'gh-pages': {
                options: {
                    base: '.grunt/site/'
                },
                src: '**/*',
                git: 'echo'
            },

            watch: {
                files: '<%= jshint.src %>',
                tasks: ['default', 'jekyll:serve']
            },

            prompt: {
                bump: {
                    options: {
                        questions: [{
                            config: 'bump.increment',
                            type: 'list',
                            message: 'Bump version from ' + '<%= pkg.version %>'.cyan + ' to:',
                            choices: [{
                                value: 'build',
                                name: 'Build: <%= pkg.version %>-? \t Unstable, betas, and release candidates.'
                            }, {
                                value: 'patch',
                                name: 'Patch: <%= semver.inc(pkg.version, "patch") %> \t Backwards-compatible bug fixes.'
                            }, {
                                value: 'minor',
                                name: 'Minor: <%= semver.inc(pkg.version, "minor") %> \t Add functionality in a backwards-compatible manner.'
                            }, {
                                value: 'major',
                                name: 'Major: <%= semver.inc(pkg.version, "major") %> \t Incompatible API changes.'
                            }]
                        }]
                    }
                }
            }
        });

        grunt.loadNpmTasks('grunt-bump');
        grunt.loadNpmTasks('grunt-checkrepo');
        grunt.loadNpmTasks('grunt-contrib-clean');
        grunt.loadNpmTasks('grunt-contrib-concat');
        grunt.loadNpmTasks('grunt-contrib-connect');
        grunt.loadNpmTasks('grunt-contrib-copy');
        grunt.loadNpmTasks('grunt-contrib-jshint');
        grunt.loadNpmTasks('grunt-contrib-qunit');
        grunt.loadNpmTasks('grunt-contrib-uglify');
        grunt.loadNpmTasks('grunt-contrib-watch');
        grunt.loadNpmTasks('grunt-gh-pages');
        grunt.loadNpmTasks('grunt-jekyll');
        grunt.loadNpmTasks('grunt-jsonlint');
        grunt.loadNpmTasks('grunt-micro');
        grunt.loadNpmTasks('grunt-prompt');

        grunt.registerTask('build', ['concat']);
        grunt.registerTask('test', ['jsonlint', 'connect', 'qunit', 'jshint', 'jekyll:test']);
        grunt.registerTask('package', ['uglify', 'micro']);
        grunt.registerTask('pre-release', ['default', 'generate-site', 'checkrepo:clean']);
        grunt.registerTask('generate-site', ['copy', 'jekyll:dist']);
        grunt.registerTask('post-release', ['checkrepo:tagged', 'gh-pages']);

        grunt.registerTask('default', ['clean', 'build', 'test', 'package']);
        grunt.registerTask('release', ['pre-release', 'prompt:bump', 'bump', 'post-release']);
    };
}(module, require('semver')));
