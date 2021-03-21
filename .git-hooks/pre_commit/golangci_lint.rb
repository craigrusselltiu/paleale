require 'fileutils'

module Overcommit::Hook::PreCommit
    # Runs `golangci-lint` against any modified Golang files.
    #
    class GolangciLint < Base
        def run
            FileUtils.cd 'kloster' do
                result = execute(command)
                output = result.stdout.chomp
                return :pass if result.success? && output.empty?
                extract_messages(output.split("\n"), /^(.*?)/)
            end
        end
    end
end
