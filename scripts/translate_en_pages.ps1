Set-Location "$PSScriptRoot\..\wwwroot\en"

$files = Get-ChildItem -Filter "*.html"

$map = [ordered]@{
  'window.location.href = "/home.html";' = 'window.location.href = "/en/home.html";'
  'redirectUri: window.location.origin + "/home.html"' = 'redirectUri: window.location.origin + "/en/home.html"'
  'Terug naar de startpagina' = 'Back to the homepage'
  'Nederlands' = 'Dutch'
  'voorwaardes' = 'terms'
  'Bijv. klassiek, pop, hiphop' = 'e.g. classical, pop, hip hop'
  'Bijv. vrolijk, rustig, spannend' = 'e.g. cheerful, calm, exciting'
  'voorwaarden' = 'terms'
  'privacyverklaring' = 'privacy policy'
  'Onderwerp (verplicht)' = 'Topic (required)'
  'Onderwerp' = 'Topic'
  'Bijv. een avontuur in het bos' = 'e.g. an adventure in the forest'
  'Bijv. dieren' = 'e.g. animals'
  'Bijv. krokodil' = 'e.g. crocodile'
  'Wat wil je tekenen?' = 'What do you want to draw?'
  'Beschrijving' = 'Description'
  'Stijl/genre (optioneel)' = 'Style/genre (optional)'
  'Stemming (optioneel)' = 'Mood (optional)'
  'Beatty maakt een nieuw liedje op basis van jouw onderwerp, stijl en stemming.' = 'Beatty creates a new song based on your topic, style, and mood.'
  'Beatty is alleen beschikbaar met een actief maandelijks of jaarlijks abonnement.' = 'Beatty is only available with an active monthly or yearly subscription.'
  'Maak met Strikey in een paar seconden een vrolijk strijkkraalmotief op basis van jouw onderwerp.' = 'Use Strikey to create a cheerful fuse-bead pattern from your topic in seconds.'
  'Geef een onderwerp en Strikey maakt een voorbeeld voor een strijkkraalmotief.' = 'Give a topic and Strikey creates a sample fuse-bead pattern.'
  'Geef een onderwerp en Strikey maakt een voorbeeldmotief dat je kunt namaken met strijkkralen.' = 'Give a topic and Strikey creates an example pattern you can recreate with fuse beads.'
  'Topic (bijv. dinosaurus, eenhoorn, voetbal)' = 'Topic (e.g. dinosaur, unicorn, football)'
  'Vul eerst een onderwerp in.' = 'Please enter a topic first.'
  'Tip: dit onderwerp is automatisch iets neutraler omschreven om een resultaat te kunnen maken.' = 'Tip: this topic was automatically rewritten in a safer way to generate a result.'
  'Log in to Strikey te gebruiken.' = 'Log in to use Strikey.'
  'Log in to Driply te gebruiken.' = 'Log in to use Driply.'
  'Met deze kleurplaat AI tool kun je eenvoudig een kleurplaat maken voor kinderen. Kies een onderwerp zoals dieren,' = 'With this AI coloring-page tool you can easily create a coloring page for kids. Choose a topic such as animals,'
  'Wie? (bijv. een aap, kat, prinses)' = 'Who? (e.g. a monkey, cat, princess)'
  'Waar? (bijv. in de jungle, thuis, op het kasteel)' = 'Where? (e.g. in the jungle, at home, at the castle)'
  'Welke activiteit? (bijv. spelen, eten, vissen)' = 'Which activity? (e.g. playing, eating, fishing)'
  '✍️ Maak tekeninstructie' = '✍️ Create drawing tutorial'
  '✨ Generate liedje' = '✨ Generate song'
  'Tap een mop!' = 'Generate a joke!'
  'Liedje wordt aangemaakt...' = 'Song is being created...'
  'Liedje wordt verwerkt...' = 'Song is being processed...'
  'Timeout: liedje nog niet klaar. Probeer later opnieuw.' = 'Timeout: the song is not ready yet. Please try again later.'
  'Vul een onderwerp in.' = 'Please enter a topic.'
  'Log in to challenges te gebruiken.' = 'Log in to use challenges.'
  'Log in to Beatty te gebruiken.' = 'Log in to use Beatty.'
  'Log in to Rollie te gebruiken.' = 'Log in to use Rollie.'
  'Log in to Scetchy te gebruiken.' = 'Log in to use Scetchy.'
  'Je hebt je 10 gratis aanvragen gebruikt. Kies een abonnement om verder te gaan.' = 'You have used your 10 free requests. Choose a subscription to continue.'
  'Maak een account aan en ontdek wat onze kindvriendelijke AI-agents voor jou kunnen doen' = 'Create an account and discover what our kid-friendly AI agents can do for you'
  'We gebruiken je e-mailadres alleen om in te loggen en voor belangrijke berichten over je account.' = 'We only use your email address for sign-in and important account messages.'
  'Account aanmaken kon niet worden afgerond. Probeer opnieuw.' = 'Account creation could not be completed. Please try again.'
  'Voer alstublieft een geldig e-mailadres in.' = 'Please enter a valid email address.'
  'Je moet akkoord gaan met de voorwaarden om een account aan te maken.' = 'You must agree to the terms to create an account.'
  'Account aanmaken is mislukt. Probeer opnieuw.' = 'Account creation failed. Please try again.'
  'Je abonnement is succesvol geactiveerd.' = 'Your subscription has been activated successfully.'
  'Je abonnement is geannuleerd of niet afgerond.' = 'Your subscription was cancelled or not completed.'
  'Je hebt het afrekenen geannuleerd. Je kunt altijd opnieuw een abonnement afsluiten via de RainyDayClub.' = 'You cancelled checkout. You can always start a new subscription via RainyDayClub.'
}

foreach ($f in $files) {
  $content = Get-Content -Raw -Path $f.FullName
  foreach ($entry in $map.GetEnumerator()) {
    $content = $content.Replace($entry.Key, $entry.Value)
  }
  Set-Content -Path $f.FullName -Value $content -NoNewline
}

Write-Output "TRANSLATION_PASS_DONE"