import urllib2
import json
import subprocess
import shutil
import os
import sys


class c:
    HEADER = '\033[35m'
    OKBLUE = '\033[34m'
    OKGREEN = '\033[32m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


BASE_URL = "";
TEMPLATES_URL = "";


def get_avail_templates():
	with urllib2.urlopen(TEMPLATES_URL) as response:
		return json.loads(response.read())


def load_template(template, location):
	try:
		git_clone_args = "clone --depth=1 %s %s" % (BASE_URL + template, location)
		subprocess.check_output(["git", git_clone_args])
		shutil.rmtree(os.join(location, ".git"))
		subprocess.check_output(["git", "init"])
		return None
	except subprocess.CalledProcessError, e:
		return e


def __print_avail_templates(avail_templates):
	avail_templates.sort(key = lambda t: t['name'])
	for template in avail_templates:
		print(c.HEADER + template['name'] + c.END + "\n"
			+ c.OKGREEN + template['description'] + c.END + "\n"
			+ c.OKBLUE + ", ".join(template['tags']) + c.END
			+ "\n")


if __name__ == "__main__":
	if len(sys.argv) == 1:
		avail_templates = get_avail_templates()
		__print_avail_templates(avail_templates)
	elif len(sys.argv) == 3:
		template = sys.argv[1]
		output_dir = sys.argv[2]
		avail_templates = get_avail_templates()
		is_valid_template = False
		for template in avail_templates:
			if template['name'] == template:
				is_valid_template = True
		if not is_valid_template:
			print(end.FAIL + "The template '" + template + "' is not valid.\n")
			__print_avail_templates(avail_templates)
			return
		error_when_loading = load_template(template, output_dir)
		if error_when_loading:
			print(c.FAIL + "Error loading template:\n" + c.END
				+ c.WARNING + e.output + c.END)
		else:
			print(c.OKGREEN + "Loaded " + c.END + c.OKBLUE
				+ template + c.END + c.OKGREEN + " into "
				+ c.END + c.OKBLUE + location + c.END + "\n")
	else:
		print("Either use " + c.OKGREEN + "fleshcode.py" + c.END
			+ " without arguments to get a list of available tempaltes, or "
			+ c.OKGREEN + "fleshcode.py {template} {output_dir}" + c.END
			+ " to load a template.")
