# dict_utils.py

def deep_get(dictionary, keys, default=None):
    for key in keys:
        if isinstance(dictionary, dict):
            dictionary = dictionary.get(key, default)
        elif isinstance(dictionary, list) and isinstance(key, int):
            try:
                dictionary = dictionary[key]
            except IndexError:
                return default
        else:
            return default
    return dictionary