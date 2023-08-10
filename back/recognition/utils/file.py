import os
from os.path import isfile


def get_files(path):
    """
    Get all files and directories available on the directory of the `path`

        Parameters:
            path: path of the target directory

        Returns:
            An array of all filename
    """
    return [f for f in os.listdir(path) if os.path.join(path, f)]


def create_dir(path):
    """
    Check and create a directory at `path` if not already created

        Parameters:
            path: path of the new directory
    """
    is_exist = os.path.exists(path)

    if not is_exist:
        # Create a new directory because it does not exist
        os.makedirs(path)
        print("The directory has been created!")


def create_file(path, file):
    """
    Create a file at `path`

        Parameters:
            path: path of the new file
            file: content of the file
    """
    with open(path, "wb") as image:
        image.write(file)
        image.close()

    return True


def delete_file(path):
    """
    Delete a file at `path`

        Parameters:
            path: path of the file
    """
    if os.path.isfile(path):
        os.remove(path)

    return True
