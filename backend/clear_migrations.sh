




# from repo root
Get-ChildItem -Path .\backend -Recurse -Filter *.py |
  Where-Object { $_.FullName -match '\\migrations\\' -and $_.Name -ne '__init__.py' } |
  Remove-Item -Force

Get-ChildItem -Path .\backend -Recurse -Directory -Filter __pycache__ |
  Remove-Item -Recurse -Force


Get-ChildItem -Path .\backend -Recurse -Filter *.pyc | Remove-Item -Force
