import os

#print(os.listdir('./hq_aspect_images_black/thaumcraft'))
files = os.listdir('./hq_aspect_images_black/thaumcraft')
string = []
for file in files:
	string.append(f"'{file[:-4]}':['','']")
print(',\n'.join(string))