import urllib2
import json
import subprocess
import shutil
import os
import sys
import tempfile


class c:
    HEADER = '\033[35m'
    OKBLUE = '\033[34m'
    OKGREEN = '\033[32m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


REPO_URL = "https://github.com/awendland/code-boilerplates.git";
TEMPLATES_URL = "https://raw.githubusercontent.com/awendland/code-boilerplates/master/templates.json";


def get_avail_templates():
	return json.loads(urllib2.urlopen(TEMPLATES_URL).read())


def load_template(template, location):
	try:
		temp_dir = tempfile.mkdtemp()
		print(c.OKBLUE)
		subprocess.check_output(["git", "clone", "--depth=1", REPO_URL, temp_dir])
		print(c.END + c.OKGREEN + "\nCopying to %s" % location + c.END)
		shutil.copytree(os.path.join(temp_dir, template), location)
		print(c.OKGREEN + "Initializing git repository at " + c.UNDERLINE + location + c.END)
		subprocess.check_output(["git", "init", location])
		return None
	except subprocess.CalledProcessError, e:
		return e
	finally:
		if temp_dir:
			shutil.rmtree(temp_dir)


def __print_avail_templates(avail_templates):
	avail_templates.sort(key = lambda t: t['name'])
	for template in avail_templates:
		print(c.HEADER + c.UNDERLINE + template['name'] + c.END + "\n"
			+ c.OKGREEN + template['description'] + c.END + "\n"
			+ c.OKBLUE + ", ".join(template['tags']) + c.END)


if __name__ == "__main__":
	if len(sys.argv) == 1:
		print("")
		avail_templates = get_avail_templates()
		__print_avail_templates(avail_templates)
	elif len(sys.argv) == 3:
		template = sys.argv[1]
		output_dir = sys.argv[2]
		avail_templates = get_avail_templates()
		is_valid_template = False
		for t in avail_templates:
			if t['name'] == template:
				is_valid_template = True
		if not is_valid_template:
			print(c.FAIL + "The template '" + template + "' is not valid.\n")
			__print_avail_templates(avail_templates)
			sys.exit(1)
		error_when_loading = load_template(template, output_dir)
		if error_when_loading:
			print(c.FAIL + "\nError loading template:\nError:\n" + c.END
				+ c.WARNING + error_when_loading.output + c.END)
		else:
			print(c.OKGREEN + "Loaded " + c.END + c.OKBLUE
				+ template + c.END + c.OKGREEN + " into "
				+ c.END + c.OKBLUE + output_dir + c.END)
	else:
		print("Either use " + c.OKGREEN + "fleshcode.py" + c.END
			+ " without arguments to get a list of available tempaltes, or "
			+ c.OKGREEN + "fleshcode.py {template} {output_dir}" + c.END
			+ " to load a template.")
