Feature: Another feature
    Scenario: Another scenario
        Given I have a step
        When I do <input>
        Then I have a third step with <result>

        Examples:
            | input | result |
            | action a | success |
            | action b | failure |