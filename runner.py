import os

def print_dir_structure(path, max_level, current_level=0, prefix=''):
    if current_level > max_level:
        return

    try:
        items = os.listdir(path)
    except PermissionError:
        return

    for item in sorted(items):
        item_path = os.path.join(path, item)
        if os.path.isdir(item_path):
            print(f"{prefix}|-- {item}/")
            print_dir_structure(item_path, max_level, current_level + 1, prefix + "    ")


if __name__ == "__main__":
    base_path = input("Enter the base directory path: ").strip()
    level = int(input("Enter the max folder level to print: "))
    print(f"\nFolder structure up to level {level}:\n")
    print_dir_structure(base_path, level)
