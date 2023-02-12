# Run from specifc card image folder.
find -type f -name "*.png" | xargs -I {} convert {} -matte ../../../mask.png -compose DstIn -composite {}
