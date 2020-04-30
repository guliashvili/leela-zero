#include "Poco/Net/HTTPServer.h"
#include "Poco/Net/HTTPRequestHandler.h"
#include "Poco/Net/HTTPRequestHandlerFactory.h"
#include "Poco/Net/HTTPServerRequest.h"
#include "Poco/Net/HTTPServerResponse.h"
#include "Poco/Util/ServerApplication.h"
#include "Poco/JSON/Parser.h"
#include <future>

// Added for the default_resource example
#include <algorithm>
#include <boost/filesystem.hpp>
#include <fstream>
#include <vector>

using namespace std;
#include   "Training.h"
#include <nlohmann/json.hpp>
using json = nlohmann::json;

#include "config.h"

#include <boost/program_options.hpp>
#include <memory>
#include <string>
#include "LeelaHelper.h"
#include "GTP.h"

using namespace Utils;
using namespace Poco;
using namespace Poco::Net;
using namespace Poco::Util;
using namespace Poco::JSON;

class HelloRequestHandler: public HTTPRequestHandler
{
private:
    const  std::vector<std::string> argv;
public:
    HelloRequestHandler(std::vector<std::string> argv): argv{argv}{
    }
    void handleRequest(HTTPServerRequest& request, HTTPServerResponse& response)
    {
      Application& app = Application::instance();
      app.logger().information("Request from %s", request.clientAddress().toString());

      response.setChunkedTransferEncoding(true);
      response.setContentType("application/json");
      Parser parser;
      auto parserRequest = parser.parse(request.stream());
      Object::Ptr objectRequest = parserRequest.extract<Object::Ptr>();

      std::vector<char*> cargv;
      cargv.reserve(argv.size());

      for(const auto &s : argv) {
        cargv.push_back((char *) (s.c_str()));
      }
       char **a = &(cargv[0]);
      char* z[6] = {"self", "-w", "/Users/gguli/Desktop/98ae471207c26af3946880caf9daaaa2d3db77b1e212660f8ab6a2b2e11a21dd", "-p", "1000", "--noponder"};
      static auto game = init(6, z);

    Training::clear_training();
    game->reset_game();

    try {
      bool isBlack = false;
      auto array =  objectRequest->getArray("moves");
      for (int i = 0; i < array->size(); i++) {
        auto move = array->getObject(i);
        const auto x = move->getValue<int>("x");
        const auto y = move->getValue<int>("y");
        isBlack = move->getValue<bool>("isBlack");

        const auto vertex = game->board.get_vertex(x, y);
        game->play_move((int) !isBlack, vertex);
      }

      const auto commandSpec = objectRequest->getObject("commandSpec");
      const auto command = commandSpec->getValue<string>("command");
      if (true) // command ===
      {
        GTP::execute(*game, "lz-genmove_analyze " + (game->board.black_to_move() ? string("b") : string("w")));
      }
      const auto[x, y]  = game->board.get_xy(game->get_last_move());
      const auto answer = json({{"move", {{"x", x}, {"y", y}, {"isBlack", !isBlack}}}}).dump();
      response.send() << answer;
    }
    catch (const exception &e) {
      std::cerr << e.what() << std::endl;
      response.send() <<  e.what();
    }
  }
};




class HelloRequestHandlerFactory: public HTTPRequestHandlerFactory
{
private:
    const const std::vector<std::string> argv;
public:
    HelloRequestHandlerFactory(std::vector<std::string> argv): argv{argv}{
    }
    HTTPRequestHandler* createRequestHandler(const HTTPServerRequest&)
    {
      return new HelloRequestHandler(argv);
    }
};

class WebServerApp: public ServerApplication
{
    void initialize(Application& self)
    {
      loadConfiguration();
      ServerApplication::initialize(self);
    }
     void defineOptions(
            OptionSet & options
    ){
       Poco::Util::Application::defineOptions(options);
      options.addOption(Poco::Util::Option("w", "w", "model").required(true).repeatable(false));
       options.addOption(Poco::Util::Option("p", "p", "depth").required(true).repeatable(false));
       options.addOption(Poco::Util::Option("noponder", "", "nopon").required(true).repeatable(false));
    }

    int main(const std::vector<std::string>& argv)
    {
      UInt16 port = static_cast<UInt16>(config().getUInt("port", 1999));

      HTTPServer srv(new HelloRequestHandlerFactory(argv), port);
      srv.start();
      waitForTerminationRequest();
      srv.stop();

      return Application::EXIT_OK;
    }
};

POCO_SERVER_MAIN(WebServerApp)
