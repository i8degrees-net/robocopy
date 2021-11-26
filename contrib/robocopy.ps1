# robocopy.ps1
#
# windows/robocopy.ps1 @ https://github.com/i8degrees-net/scratch.git
#
# SEE ALSO,
#
# https://www.techrepublic.com/article/how-to-quickly-back-up-just-your-data-in-windows-10-with-robocopys-multi-threaded-feature/
Import-Module dotenv

Set-StrictMode -Version Latest

Set-DotEnv .env

# $dryRun = $true;
$dryRun = Get-Item -Path $Env:$NOM_DRYRUN;

# TODO(jeff): Implement feature!
$verbose = $true;
# TODO(jeff): Implement feature!
$debug = $true;

# FIXME(jeff): Implement me!
function path_exists {
  result = false;
  return result;
}

function build_file_filter_list([Array]$list) {
  $result = [System.Collections.ArrayList]::new();

  $numArgs = $list.length;
  For($idx = 0; $idx -lt $numArgs; $idx++) {
    $arg = $list[$idx];
    [void]$result.Add("/xf $arg");
  }

  return $result;
}

function build_dir_filter_list([Array]$list) {
  $result = [System.Collections.ArrayList]::new();

  $numArgs = $list.length;
  For($idx = 0; $idx -lt $numArgs; $idx++) {
    $arg = $list[$idx];
    [void]$result.Add("/xd $arg");
  }

  return $result;
}

#runas.exe /user:leo/administrator "robocopy $args_in"
function execute_robocopy([Array]$args_in) {
  $default_args = @("/copyall", "/e", "/z", "/xa:sh", "/V", "/NP", "/R:5", "/MT:5");
  $args_out = [System.Collections.ArrayList]::new();
  [void]$args_out.Add("robocopy $default_args");

  $numArgs = $args_in.length;
  For($idx = 0; $idx -lt $numArgs; $idx++) {
    $arg = $args_in[$idx];
    [void]$args_out.Add(" $arg");
  }

  if($dryRun -eq $true) {
    Write-Host $args_out
  }

  return $args_out;
}

$file_filter = build_file_filter_list @("Thumbs.db", ".DS_Store", "._*", "*un~*")
$dir_filter = build_dir_filter_list @("node_modules")

# Write-Output "File filter is..."
# Write-Output $file_filter

# Write-Output "Dir filter is..."
# Write-Output $dir_filter

$useMirrorTransfer = $true;
$default_params = [System.Collections.ArrayList]::new();
[void]$default_params.Add("C:/Users/i8deg/Software");
[void]$default_params.Add("D:/Software");
[void]$default_params.Add("/LOG+:sync.log");
[void]$default_params.Add($file_filter);
[void]$default_params.Add($dir_filter);

if($useMirrorTransfer -eq $true) {
  [void]$default_params.Add("/MIR");
}

$output = "";
$output = execute_robocopy $default_params
# Write-Host $output

exit 0

robocopy C:\users\i8deg\.yarnrc D:\.yarnrc /copyall /e /z /xa:sh /V /NP /R:5 /xf Thumbs.db /xf .DS_Store /xf ._* /xd node_modules /xf *un~* /LOG+:D:\sync.log
robocopy C:\users\i8deg\.npmrc D:\.npmrc /copyall /e /z /xa:sh /V /NP /R:5 /xf Thumbs.db /xf .DS_Store /xf ._* /xd node_modules  /xf *un~* /LOG+:D:\sync.log
robocopy C:\users\i8deg\.ssh D:\.ssh /copyall /e /z /xa:sh /V /NP /R:5 /xf Thumbs.db /xf .DS_Store /xf ._* /xd node_modules /xf *un~* /LOG+:D:\sync.log
robocopy C:\users\i8deg\.gitconfig D:\.gitconfig /copyall /e /z /xa:sh /V /NP /R:5 /xf Thumbs.db /xf .DS_Store /xf ._* /xd node_modules /xf *un~* /LOG+:D:\sync.log
robocopy C:\users\i8deg\.git-secrets D:\.git-secrets /copyall /e /z /xa:sh /V /NP /R:5 /xf Thumbs.db /xf .DS_Store /xf ._* /xd node_modules /xf *un~* /LOG+:D:\sync.log
robocopy C:\users\i8deg\.wslconfig D:\.wslconfig /copyall /e /z /xa:sh /V /NP /R:5 /xf Thumbs.db /xf .DS_Store /xf ._* /xd node_modules /xf *un~* /LOG+:D:\sync.log
robocopy C:\users\i8deg\Backups D:\Backups /copyall /e /z /xa:sh /V /NP /R:5 /xf Thumbs.db /xf .DS_Store /xf ._* /xd node_modules /xf *un~* /LOG+:D:\sync.log
robocopy C:\users\i8deg\Desktop D:\Desktop /copyall /e /z /xa:sh /V /NP /R:5 /xf Thumbs.db /xf .DS_Store /xf ._* /xd node_modules /xf *un~* /LOG+:D:\sync.log
robocopy C:\users\i8deg\dotfiles D:\dotfiles /copyall /e /z /xa:sh /V /NP /R:5 /xf Thumbs.db /xf .DS_Store /xf ._* /xd node_modules /xf *un~* /LOG+:D:\sync.log
robocopy C:\users\i8deg\dotfiles.git D:\dotfiles.git /copyall /e /z /xa:sh /V /NP /R:5 /xf Thumbs.db /xf .DS_Store /xf ._* /xd node_modules /xf *un~* /LOG+:D:\sync.log
#robocopy C:\users\i8deg\Music D:\Music /copyall /e /z /xa:sh /V /NP /R:5 /xf Thumbs.db /xf .DS_Store /xf ._* /xd node_modules /xf *un~* /LOG+:D:\sync.log
#robocopy C:\users\i8deg\Videos D:\Videos /copyall /e /z /xa:sh /V /NP /R:5 /xf Thumbs.db /xf .DS_Store /xf ._* /xd node_modules /xf *un~* /LOG+:D:\sync.log
#robocopy C:\users\i8deg\Documents D:\Documents /copyall /e /z /xa:sh /V /NP /R:5 /xf Thumbs.db /xf .DS_Store /xf ._* /xd node_modules /xf *un~* /LOG+:D:\sync.log
robocopy C:\users\i8deg\Downloads D:\Downloads /copyall /e /z /xa:sh /V /NP /R:5 /xf Thumbs.db /xf .DS_Store /xf ._* /xd node_modules /xf *un~* /LOG+:D:\sync.log
robocopy C:\users\i8deg\Pictures D:\Pictures /copyall /e /z /v /xa:sh /V /NP /R:5 /xf Thumbs.db /xf .DS_Store /xf ._* /xd node_modules /xf *un~* /LOG+:D:\sync.log
robocopy C:\users\i8deg\Projects D:\Projects /copyall /e /z /v /xa:sh /V /NP /R:5 /xf Thumbs.db /xf .DS_Store /xf ._* /xd node_modules /xf *un~* /LOG+:D:\sync.log
robocopy C:\users\i8deg\Software D:\Software /copyall /e /z /v /xa:sh /V /NP /R:5 /xf Thumbs.db /xf .DS_Store /xf ._* /xd node_modules /xf *un~* /LOG+:D:\sync.log
