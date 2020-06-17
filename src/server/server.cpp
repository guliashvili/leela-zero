#include "Poco/Net/HTTPServer.h"
#include "Poco/Net/HTTPRequestHandler.h"
#include "Poco/Net/HTTPRequestHandlerFactory.h"
#include "Poco/Net/HTTPServerRequest.h"
#include "Poco/Net/HTTPServerResponse.h"
#include "Poco/Util/ServerApplication.h"
#include "Poco/JSON/Parser.h"
#include <future>
#include <fstream>
#include <vector>
#include <mutex>
#include <nlohmann/json.hpp>
#include "config.h"
#include <boost/program_options.hpp>
#include <memory>
#include <string>
#include "LeelaHelper.h"
#include "GTP.h"
using namespace std;
using json = nlohmann::json;
using namespace Utils;
using namespace Poco;
using namespace Poco::Net;
using namespace Poco::Util;
using namespace Poco::JSON;

class HelloRequestHandler: public HTTPRequestHandler
{
    void handleRequest(HTTPServerRequest& request, HTTPServerResponse& response)
    {
      Application& app = Application::instance();
      app.logger().information("Request from %s", request.clientAddress().toString());

      response.setChunkedTransferEncoding(true);
      response.setContentType("application/json");
      Parser parser;
      auto parserRequest = parser.parse(request.stream());
      Object::Ptr objectRequest = parserRequest.extract<Object::Ptr>();

      char* z[4] = {"self", "-w","best-network", "--noponder"};

      static std::mutex g_pages_mutex;


      std::lock_guard<std::mutex> guard(g_pages_mutex);
      static auto game = init(4, z);

    game->reset_game();

    try {
      bool isBlack = false;
      auto array =  objectRequest->getArray("moves");
      for (int i = 0; i < array->size(); i++) {
        auto move = array->getObject(i);
        const auto x = move->getValue<int>("x");
        const auto y = move->getValue<int>("y");
        isBlack = move->getValue<bool>("isBlack");
        cerr<<"got"<<x<<' '<<y<<' '<<isBlack<<endl;

        const auto vertex = game->board.get_vertex(x, y);
        game->play_move((int) !isBlack, vertex);
      }
      boardIdentifier = objectRequest->getValue<std::string>("boardIdentifier");
      clientIdentifier = objectRequest->getValue<std::string>("clientIdentifier");

      const auto commandSpec = objectRequest->getObject("commandSpec");
      const auto command = commandSpec->getValue<string>("command");
      if (true) // command ===
      {
        GTP::execute(*game, "lz-genmove_analyze " + (game->board.black_to_move() ? string("b") : string("w")));
      }
      const auto[x, y]  = game->board.get_xy(game->get_last_move());
      game->display_state();
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
    HTTPRequestHandler* createRequestHandler(const HTTPServerRequest&)
    {
      return new HelloRequestHandler();
    }
};

class WebServerApp: public ServerApplication
{
    void initialize(Application& self)
    {
      loadConfiguration();
      ServerApplication::initialize(self);
    }


    int main(const std::vector<std::string>& )
    {
      UInt16 port = static_cast<UInt16>(config().getUInt("port", 1999));

      HTTPServer srv(new HelloRequestHandlerFactory(), port);
      srv.start();
      waitForTerminationRequest();
      srv.stop();

      return Application::EXIT_OK;
    }
};

POCO_SERVER_MAIN(WebServerApp)
