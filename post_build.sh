#!/bin/sh
echo "Start pre-commit"

s1=$(npm run test)
s2=$(npm run fuzz)
s3=$(npm run lint)

s11=$(echo "$s1" | grep -Eo "Statements.*\d\d%" | grep -o '[^ ]*%')
s21=$(echo "$s2" | grep -Eo "Statements.*\d\d%" | grep -o '[^ ]*%')
s31=$(echo "$s3" | grep -Eo "\d problems" | grep -o '[^ ]*')
s32=$(echo "$s3" | grep -Eo "\d errors" | grep -o '[^ ]*')
s33=$(echo "$s3" | grep -Eo "\d warnings" | grep -o '[^ ]*')

# remove '#'
s12="${s11%?}"
# echo $s12
s22="${s21%?}"
# echo $s22
# echo $s31
# echo $s32
# echo $s33

# echo "$s12 < 94.9" |bc -l
# echo "$s12 < 95.9" |bc -l

if [ $(echo "$s12 < 94.9" |bc -l) -eq 1 ]; then
	echo "$s12% Statements coverage is smaller than threshold, commit refused!"
	exit 1
else
	echo "$s12% Statements coverage is larger than threshold"
fi

if [ $(echo "$s22 < 95.9" |bc -l) -eq 1 ]; then
	echo "$s22% Statements coverage is smaller than threshold, commit refused!"
	exit 1
else
	echo "$s22% Statements coverage is larger than threshold"
fi

if [ $(echo "$s32 > 0" |bc -l) -eq 1 ]; then
	echo "The code contains $s32 errors, commit refused!"
	exit 1
else
	echo "The code contains $s32 errors"
fi

if [ $(echo "$s33 > 0" |bc -l) -eq 1 ]; then
	echo "The code contains $s33 warnings, commit refused!"
	exit 1
else
	echo "The code contains $s33 warnings"
fi

echo "End pre-commit"