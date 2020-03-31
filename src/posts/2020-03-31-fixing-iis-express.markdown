Cannot start the website because administrative privileges are required to bind to the hostname or port

This was because I had previously reserved the port in a bid to get the site working before. This had worked for years, then stopped. Removing the reservation fixed the admin issue.

PowerShell (wiuth admin)

netsh http show urlacl <-- Lists reservations

netsh http delete urlacl url=[insert reserved url here]
netsh http delete urlacl url=http://*:19534/

Failed to register URL ‘https://localhost:49788/’ for site ‘EXAMPLE. API’ application ‘/’. Error description: The process cannot access the file because it is being used by another process.

This was because Docker reserves a lot of ports. 

netsh int ipv4 show excludedportrange protocol=tcp <-- List of reserved ports
