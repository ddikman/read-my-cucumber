@sometag
Feature: This is a cucumber feature

    @scenariotag
    Scenario: This is a cucumber scenario
        Given I have a step
        When I have another step
        Then I have a third step with <result>

        Examples:
            | result |
            | success |
            | failure |