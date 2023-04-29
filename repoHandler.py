import sys
import os
import base64
import zipfile
import json
import subprocess
import shutil

tempdir = os.environ.get('TMPDIR')
if sys.argv[1] == "Content":

    # create temp/ directory
    
    with open(f'{tempdir}/content.txt', 'r') as f:
        base64Data = f.read()
    # os.remove('content.txt')


    # if not os.path.exists('temp'):
    #     os.makedirs('temp')

    
    # print(dirs_before_extraction)

    # decode, save, and unzip repository
    zipData = base64.b64decode(base64Data)
    filename = f'{tempdir}/repository.zip'
    # filename = './temp/repository.zip'
    with open(filename, 'wb') as f:
        f.write(zipData)

    dirs_before_extraction = os.listdir(tempdir)

    
    with zipfile.ZipFile(filename, 'r') as zip_ref:
        zip_ref.extractall(tempdir)


    # reponame = [dir_name for dir_name in os.listdir('temp') if os.path.isdir(os.path.join('temp', dir_name))][0]
    
    dirs_after_extraction = os.listdir(tempdir)
    # print('-------')
    # print(dirs_after_extraction)
    reponame = list(set(dirs_after_extraction) - set(dirs_before_extraction))[0]
    print(reponame)
    with open('reponame.txt', 'w') as f:
        f.write(reponame)

    # with open(f'temp/{reponame}/package.json', 'r') as f:
    with open(f'{tempdir}/{reponame}/package.json', 'r') as f:
        data = f.read()

    # Parse the JSON data
    parsed_data = json.loads(data)

    # Extract the value of the "field_name" field
    name = parsed_data['name']
    version = parsed_data['version']
    url = parsed_data['homepage']

    data = {
        "Name": name,
        "Version": version,
        "URL": url,
        "reponame": reponame
    }

    json_data = json.dumps(data)

    # with open('temp/info.json', 'w') as f:
    with open(f'{tempdir}/info.json', 'w') as f:
        f.write(json_data)


    





elif sys.argv[1] == "URL":
    URL = sys.argv[2]

    # create temp/ directory and clone repo
    # if not os.path.exists('temp'):
    #     os.makedirs('temp')
    # os.chdir('temp')

    # os.system(f'git clone {URL}')
    # os.chdir('..')

    # dirs_before_clone = os.listdir(tempdir)
    os.system(f'git clone --depth 1 {URL} {tempdir}cloningdirectory')
    # dirs_after_clone = os.listdir(tempdir)
    # reponame = list(set(dirs_after_clone) - set(dirs_before_clone))[0]
    # reponame = [dir_name for dir_name in os.listdir(f'{tempdir}/cloningdirectory') if os.path.isdir(os.path.join(f'{tempdir}/cloningdirectory', dir_name))][0]
    # print('message')
    # print(reponame)

    # reponame = 'cloningdirectory'


    # folder_path = f'{tempdir}/cloningdirectory/{reponame}'
    folder_path = f'{tempdir}/cloningdirectory'
    zip_file_path = f'{tempdir}/repository'
    shutil.make_archive(base_name=zip_file_path, format='zip', root_dir=folder_path)

    # shutil.make_archive(base_name=f'{tempdir}/repository', format='zip', root_dir=f'{tempdir}')

    with open(f'{tempdir}/repository.zip', 'rb') as file:
        content = base64.b64encode(file.read()).decode('utf-8')
    
    
 
   
    # with open('content.txt', 'w') as f:
    #     f.write(content)

    with open(f'{tempdir}/cloningdirectory/package.json', 'r') as f:
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

    print(data['Name'])
    print(data['Version'])

    with open(f'{tempdir}/info.json', 'w') as f:
        f.write(json_data)

    with open(f'{tempdir}/content.txt', 'w') as f:
        f.write(content)

