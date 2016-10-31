#/bin/sh
ant resolve && ant clean build deploy package-source -lib "lib"
