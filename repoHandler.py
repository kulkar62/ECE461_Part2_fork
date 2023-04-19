import sys
import os
import base64
import zipfile
import json
import subprocess

if sys.argv[1] == "Content":


    base64Data = sys.argv[2]
    if not os.path.exists('temp'):
        os.makedirs('temp')

    zipData = base64.b64decode(base64Data)

    filename = './temp/repository.zip'
    with open(filename, 'wb') as f:
        f.write(zipData)

    with zipfile.ZipFile(filename, 'r') as zip_ref:
        zip_ref.extractall('temp')

elif sys.argv[1] == "URL":
    URL = sys.argv[2]
    if not os.path.exists('temp'):
        os.makedirs('temp')
    os.chdir('temp')
    os.system(f'git clone {URL}')
    os.chdir('..')




reponame = [dir_name for dir_name in os.listdir('temp') if os.path.isdir(os.path.join('temp', dir_name))][0]


with open(f'temp/{reponame}/package.json', 'r') as f:
    data = f.read()

# Parse the JSON data
parsed_data = json.loads(data)

# Extract the value of the "field_name" field
name = parsed_data['name']
version = parsed_data['version']

data = {
    "Name": name,
    "Version": version
}

json_data = json.dumps(data)

with open('temp/info.json', 'w') as f:
    f.write(json_data)

# elif sys.argv[1] == "URL":
#     URL = sys.argv[2]
#     if not os.path.exists('temp'):
#         os.makedirs('temp')
#     os.chdir('temp')
#     os.system(f'git clone {URL}')
#     os.chdir('..')

#     reponame = [dir_name for dir_name in os.listdir('temp') if os.path.isdir(os.path.join('temp', dir_name))][0]



    # subprocess.run('git', 'clone', URL)

