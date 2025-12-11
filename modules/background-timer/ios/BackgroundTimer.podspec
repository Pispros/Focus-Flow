Pod::Spec.new do |s|
  s.name         = "BackgroundTimer"
  s.version      = "1.0.0"
  s.summary      = "Background timer for FocusFlow"
  s.homepage     = "https://github.com/Pispros/Focus-Flow"
  s.license      = "MIT"
  s.author       = { "FocusFlow" => "focusflow@example.com" }
  s.platform     = :ios, "13.4"
  s.source       = { :git => "https://github.com/Pispros/Focus-Flow.git", :tag => "#{s.version}" }
  s.source_files = "*.{h,m,swift}"
  s.requires_arc = true

  s.dependency "React-Core"
end
