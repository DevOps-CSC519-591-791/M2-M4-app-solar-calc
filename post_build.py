import subprocess
import re

s1 = subprocess.Popen(["npm", "run", "fuzz"], stdout=subprocess.PIPE).communicate()[0]
s2 = subprocess.Popen(["npm", "run", "lint"], stdout=subprocess.PIPE).communicate()[0]

# print s1
# print len(s1)

# print s2
# print len(s2)
# print len(output)

s1_match_obj = re.search(r'Statements.*([\d\.]*)%', s1)
s2_match_obj = re.search(r'(\d+) errors, (\d+) warnings', s2)

report = "\n\n========== Analysis Report ==========\n"
if s1_match_obj:
	
	stat = re.findall(r'\d+' ,s1_match_obj.group(0))[0]
	# print "Statement Coverage: " + re.findall(r'\d+' ,s1_match_obj.group(0))[0]
	if int(stat) < 95:
		report += "Statement Coverage: " + stat + ", which is lower than threshold 97%\n"
	else:
		report += "Statement Coverage: " + stat + ", good job!\n"
else:
	report += "No Statement Coverage Matched\n"

if s2_match_obj:
	num_err = s2_match_obj.group(1)
	num_war = s2_match_obj.group(2)
	if int(num_err) > 0:
		report += "# of errors: " + num_err + ", please correct error(s)\n"
	else:
		report += "# of errors: " + num_err + ", good job!\n"

	if int(num_war) > 0:
		report += "# of warnings: " + num_war + ", please correct warning(s)\n"
	else:
		report += "# of warnings: " + num_war + ", good job!\n"

else:
	report += "No error or warning\n"

report += "========== End of Report =========="
print report