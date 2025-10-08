import nltk
import ssl

try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

print("--- Starting Final NLTK Data Download ---")


required_packages = [
    'punkt',      
    'punkt_tab',  
    'wordnet',  
    'omw-1.4',    
    'stopwords'   
]


for package in required_packages:
    try:
        print(f"Checking for '{package}'...")

        if 'punkt' in package:
             nltk.data.find(f'tokenizers/{package}')
        elif package == 'stopwords':
             nltk.data.find(f'corpora/{package}')
        else:
             nltk.data.find(f'corpora/{package}.zip')
        print(f" '{package}' is already available.")
    except LookupError:
        print(f"Downloading '{package}'...")
        nltk.download(package) 
        print(f" Download complete for '{package}'.")

print("\n--- All NLTK data packages should now be complete. ---")



    

