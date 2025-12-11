require 'json'

package = JSON.parse(File.read(File.join(__dir__, '../package.json')))

Pod::Spec.new do |s|
  s.name         = "DeviceUnlock"
  s.version      = package['version']
  s.summary      = package['description'] || "Device unlock detection for React Native"
  s.homepage     = "https://github.com/focusflow/device-unlock"
  s.license      = package['license'] || "MIT"
  s.author       = { "author" => "author@domain.com" }
  s.platforms    = { :ios => "13.0" }
  s.source       = { :git => "https://github.com/focusflow/device-unlock.git", :tag => "#{s.version}" }
  
  s.source_files = "*.{h,m,swift}"
  
  s.dependency "React-Core"
  
  s.swift_version = '5.0'
end
