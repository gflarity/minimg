# MinIMG

MinIMG is a simple image (jpg) viewer in the form of a self contained "single
file" Web App. Use the arrow keys to navigate through the images in a directory.

## Prequisites

1. [Deno](http://deno.land)
2. A modern web browser like Chrome, or FireFox, etc.

## Quick Start

Simply symlink the minimg launcher somwhere in your path, for example I use
`~/bin`:

```sh
cd ~/bin
ln -s ~/git/minimg/minimg
```

Now just run `minimg` in a director with JPG files:

```sh
minimg
```

## Limitations

Currently only Mac OS or Windows is supported. Supporting linux would be
trivial, PRs welcome.
