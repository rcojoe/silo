<?php

namespace Silo\Context;

use Behat\Behat\Context\BehatContext;
use Silo\Inventory\Model\User;
use Symfony\Component\HttpKernel\Client;
use Symfony\Component\HttpKernel\HttpKernelInterface;
use Behat\Behat\Exception\PendingException;
use Behat\Gherkin\Node\TableNode;
use Silo\Context\AppAwareContextInterface;

/**
 * Create a new Silo app, and spawn an empty test database.
 * Injects an app reference inside AppAwareContextInterface Contexts.
 * Expose a reference system that can be used to retrieve objects between steps.
 */
class AppContext extends BehatContext
{
    protected $app;

    protected $dsn;

    protected $debug;

    /** @var \Doctrine\ORM\EntityManager */
    private $em;

    private $refs = [];

    public function getRef($name)
    {
        if (!isset($this->refs[$name])) {
            throw new \Exception("No such ref $name");
        }

        return $this->refs[$name];
    }

    public function setRef($name, $object)
    {
        if (isset($this->refs[$name])) {
            throw new \Exception("Ref $name is already set");
        }
        // $this->printDebug("Set Ref $name as $object");
        $this->refs[$name] = $object;
    }



    /**
     * {@inheritdoc}
     */
    public function __construct(array $parameters)
    {
        $this->dsn = isset($parameters['dsn']) ? $parameters['dsn'] : 'sqlite:///:memory:';
        //$this->debug = $parameters['debug']?: null;
    }

    /** @BeforeScenario */
    public function before($event)
    {
        $that = $this;
        $logger = new \Monolog\Logger('test');
        $logger->pushHandler(new \Silo\Base\CallbackHandler(function($record)use($that){
            if (stripos($record['message'], 'Matched route') === 0){return;}
            echo "\033[36m|  ".strtr($record['message'], array("\n" => "\n|  "))."\033[0m\n";
        }, \Monolog\Logger::INFO));

        $this->app = $app = new \Silo\Silo([
            'em.dsn' => $this->dsn,
            'logger' => $logger
        ]);
        $app->boot();
        $this->em = $em = $app['em'];

        // Generate the database
        $metadatas = $em->getMetadataFactory()->getAllMetadata();

        $tool = new \Doctrine\ORM\Tools\SchemaTool($this->app['em']);
        $tool->createSchema($metadatas);

        $user = new User('test');
        $em->persist($user);
        $em->flush();
        $app['current_user'] = $user;
        $this->setRef('User', $user);

        $mainContext = $this->getMainContext();
        if ($mainContext instanceof AppAwareContextInterface) {
            $mainContext->setApp($app);
        }

        if ($mainContext instanceof ClientContextInterface) {
            $mainContext->setClient(new Client($app));
        }

        foreach ($mainContext->getSubcontexts() as $context) {
            if ($context instanceof AppAwareContextInterface) {
                $context->setApp($app);
            }

            if ($context instanceof ClientContextInterface) {
                $context->setClient(new Client($app));
            }
        }

        // Register a logger if needed
        if (isset($this->parameters['debugDoctrine']) && $this->parameters['debugDoctrine']) {
            $em->getConnection()
                ->getConfiguration()
                ->setSQLLogger(new \PrintDebugLogger($this))
            ;
        }
    }
}